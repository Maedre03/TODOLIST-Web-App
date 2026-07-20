# TodoList Web App

A professional-grade To-Do list application built with .NET 10 Clean Architecture and Angular 18+.

## Features
- **Clean Architecture**: Domain, Application, Infrastructure, API layers.
- **CQRS**: Command Query Responsibility Segregation with MediatR.
- **Security**: JWT Authentication, BCrypt Password Hashing, HTTPs, CORS.
- **Frontend**: Angular 18 with Signals, PrimeNG UI, Drag-and-Drop Kanban.
- **Database**: SQL Server via Entity Framework Core with automatic migrations.

## Getting Started

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) & npm
- [Docker](https://www.docker.com/)

### Running with Docker Compose (Backend only)
```bash
docker-compose up -d
```
This will start both the SQL Server and the .NET API. The API will automatically apply migrations on startup.
Swagger API Docs will be available at: `http://localhost:5000/swagger`

### Running Locally (Without Docker API)
1. Start the database: `docker-compose up sqlserver -d`
2. Run the API:
```bash
cd src/TodoList.Api
dotnet run
```
3. Run the Frontend:
```bash
cd src/TodoList.Web
npm install
npm start
```
The frontend will be available at `http://localhost:4200`

## Architecture

- **TodoList.Domain**: Core business logic and entities.
- **TodoList.Application**: Use cases, MediatR handlers, DTOs, Validation.
- **TodoList.Infrastructure**: EF Core, JWT Services, Repositories.
- **TodoList.Api**: Controllers, Middleware, API endpoints.
- **TodoList.Web**: Angular frontend.
