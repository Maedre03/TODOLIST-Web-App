FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/TodoList.Api/TodoList.Api.csproj", "src/TodoList.Api/"]
COPY ["src/TodoList.Application/TodoList.Application.csproj", "src/TodoList.Application/"]
COPY ["src/TodoList.Domain/TodoList.Domain.csproj", "src/TodoList.Domain/"]
COPY ["src/TodoList.Infrastructure/TodoList.Infrastructure.csproj", "src/TodoList.Infrastructure/"]
RUN dotnet restore "src/TodoList.Api/TodoList.Api.csproj"
COPY . .
WORKDIR "/src/src/TodoList.Api"
RUN dotnet build "TodoList.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TodoList.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TodoList.Api.dll"]
