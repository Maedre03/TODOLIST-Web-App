using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TodoList.Domain.Repositories;
using TodoList.Infrastructure.Persistence;
using TodoList.Infrastructure.Persistence.Repositories;
using TodoList.Application.Common.Interfaces;
using TodoList.Infrastructure.Services;

namespace TodoList.Infrastructure;

public static class InfrastructureServiceExtensions
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

        services.AddScoped<ITodoRepository, TodoRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IFileStorageService, LocalFileStorageService>();
        services.AddScoped<ITagRepository, TagRepository>();
        services.AddScoped<TodoList.Domain.Repositories.IUnitOfWork>(provider => provider.GetRequiredService<ApplicationDbContext>());
        
        services.AddTransient<TodoList.Application.Common.Interfaces.IDateTimeProvider, TodoList.Infrastructure.Services.DateTimeProvider>();
        services.AddScoped<TodoList.Application.Common.Interfaces.IPasswordHasher, TodoList.Infrastructure.Services.PasswordHasher>();
        services.AddScoped<TodoList.Application.Common.Interfaces.IJwtTokenService, TodoList.Infrastructure.Services.JwtTokenService>();

        services.AddHostedService<DailyDigestBackgroundService>();

        return services;
    }
}
