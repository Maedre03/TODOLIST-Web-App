# TodoList Web Application

A full-stack, production-grade Todo List application built with an ASP.NET Core backend and an Angular frontend.

This project is built focusing on clean architecture, security, testability, observability, and maintainability. It's not just "working code"; it's a structural reference for a real-world enterprise project.

## Architecture

The solution uses Clean Architecture and separates concerns into layers:
- **Domain Layer (`TodoList.Domain`)**: Core business logic and entities, entirely independent of other layers.
- **Application Layer (`TodoList.Application`)**: Orchestrates use cases using the CQRS pattern with MediatR.
- **Infrastructure Layer (`TodoList.Infrastructure`)**: Integrates external concerns (e.g., Entity Framework Core for Database, Auth, External APIs).
- **Presentation Layer (`TodoList.Api`)**: The REST API surface area using ASP.NET Core.

## Technologies Used

### Backend
- **Framework**: .NET 8 (or latest) / ASP.NET Core Web API
- **Architecture**: Clean Architecture & CQRS Pattern
- **Libraries**:
  - MediatR (CQRS)
  - Entity Framework Core (ORM)
  - FluentValidation
  - Mapster or AutoMapper (Object mapping)

### Frontend
- **Framework**: Angular
- **Styling**: Tailwind CSS (or Vanilla CSS based on choices)

## Getting Started

### Prerequisites
- [.NET SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/)
- [Angular CLI](https://angular.io/cli)

### Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/Maedre03/TODOLIST-Web-App.git
   ```

2. **Backend**:
   - Navigate to the `src/TodoList.Api` folder.
   - Run `dotnet restore` to restore packages.
   - Run `dotnet run` to start the API (defaults to `https://localhost:7122` or similar).

3. **Frontend**:
   - Navigate to the `TodoList.Web` folder.
   - Run `npm install` to install dependencies.
   - Run `ng serve` to start the Angular dev server (defaults to `http://localhost:4200`).

## Project Status

Currently in active development. (Phase 1 Domain layer completed)
