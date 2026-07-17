# TodoList — Professional Project Task List

> A real company project is not just "working code". It has structure, security, testability, observability, and maintainability baked in from day one. This list covers everything needed to take this project from a student exercise to a production-grade application.

---

## 🏗️ PHASE 1 — Domain Layer (`TodoList.Domain`)

The heart of the application. Contains pure business logic with zero external dependencies.

- [x] Define `Todo` entity with proper properties
  - `Id` (Guid — not int, UUIDs are industry standard)
  - `Title`, `Description`
  - `IsCompleted`, `Priority` (enum: Low / Medium / High)
  - `DueDate` (nullable)
  - `CreatedAt`, `UpdatedAt` (audit fields)
  - `CreatedByUserId` (ownership)
  - `IsDeleted` (soft delete — don't erase data permanently)
- [x] Define `User` entity (for ownership of todos)
- [x] Define base `Entity<TId>` abstract class (so all entities share common fields)
- [x] Define `Priority` enum
- [x] Define `IDomainEvent` interface and base domain events (e.g. `TodoCreatedEvent`)
- [x] Define `IRepository<T>` and `ITodoRepository` interfaces (contracts)
- [x] Define custom **Domain Exceptions** (e.g. `TodoNotFoundException`, `UnauthorizedTodoAccessException`)

---

## ⚙️ PHASE 2 — Application Layer (`TodoList.Application`)

Orchestrates use cases. Contains no database or HTTP knowledge — only business logic flow.

### Pattern: CQRS with MediatR
Industry standard — separates "reading data" from "changing data".

- [x] Install `MediatR` NuGet package
- [x] Set up MediatR dependency injection registration

### Commands (actions that change data)
- [x] `CreateTodoCommand` + `CreateTodoCommandHandler`
- [x] `UpdateTodoCommand` + `UpdateTodoCommandHandler`
- [x] `DeleteTodoCommand` + `DeleteTodoCommandHandler`
- [x] `ToggleTodoCompleteCommand` + Handler
- [x] `RegisterUserCommand` + Handler
- [x] `LoginUserCommand` + Handler (returns JWT token)

### Queries (actions that read data)
- [x] `GetAllTodosQuery` + `GetAllTodosQueryHandler`
- [x] `GetTodoByIdQuery` + Handler
- [x] `GetTodosPagedQuery` + Handler (with pagination, filtering, sorting)

### DTOs (Data Transfer Objects)
- [x] `TodoDto` (what the API returns to the frontend)
- [ ] `CreateTodoRequest`, `UpdateTodoRequest` (what the frontend sends)
- [x] `PagedResult<T>` generic response wrapper (for paginated lists)
- [ ] `ApiResponse<T>` generic success/error response wrapper

### Validation (FluentValidation)
- [ ] `CreateTodoCommandValidator` (title required, max length, dueDate not in past, etc.)
- [ ] `UpdateTodoCommandValidator`
- [ ] `RegisterUserCommandValidator` (email format, password strength, etc.)
- [ ] Wire FluentValidation into MediatR pipeline via `ValidationBehavior`

### AutoMapper Profiles
- [ ] `TodoMappingProfile` (`Todo` entity → `TodoDto`)
- [ ] `UserMappingProfile`

### Pipeline Behaviors (MediatR middleware)
- [ ] `ValidationBehavior<TRequest, TResponse>` — auto-validate every command
- [ ] `LoggingBehavior<TRequest, TResponse>` — log every command/query execution
- [ ] `PerformanceBehavior<TRequest, TResponse>` — warn if a handler takes >500ms

### Interfaces / Abstractions
- [ ] `ICurrentUserService` — abstraction to get the currently logged-in user's ID
- [ ] `IDateTimeProvider` — abstraction for getting current time (makes testing easy)
- [ ] `IJwtTokenService` — abstraction for generating JWT tokens

---

## 🗄️ PHASE 3 — Infrastructure Layer (`TodoList.Infrastructure`)

Implements all the interfaces defined in Application. The only layer that knows about the database.

### Entity Framework Core / Database
- [ ] Create `ApplicationDbContext` (registers all entities)
- [ ] Configure entity mappings using **Fluent API** (table names, column types, indexes)
  - [ ] `TodoConfiguration` (indexes on `UserId`, `IsDeleted`)
  - [ ] `UserConfiguration`
- [ ] Implement **soft delete** — override `SaveChangesAsync` to set `IsDeleted=true` instead of deleting
- [ ] Implement **automatic auditing** — auto-set `CreatedAt`, `UpdatedAt` on save
- [ ] Create first database migration: `InitialCreate`
- [ ] Create database seeder for development data

### Repositories
- [ ] `GenericRepository<T>` implementing `IRepository<T>` (base CRUD)
- [ ] `TodoRepository` implementing `ITodoRepository` (todo-specific queries)

### Authentication
- [ ] Install `Microsoft.AspNetCore.Authentication.JwtBearer`
- [ ] Install `BCrypt.Net-Next` (for hashing passwords — NEVER store plain text)
- [ ] Implement `JwtTokenService` (generates signed JWT tokens)
- [ ] Implement `PasswordHasher` (using BCrypt)

### Dependency Injection
- [ ] `InfrastructureServiceExtensions` — register all Infrastructure services in one place

---

## 🌐 PHASE 4 — API Layer (`TodoList.Api`)

The HTTP interface. Thin layer — just receives requests and delegates to Application.

### Structure
- [ ] Create `Controllers/` folder (or use Minimal API Endpoints)
  - [ ] `TodosController` (CRUD endpoints)
  - [ ] `AuthController` (register, login)
- [ ] Implement **Route versioning** (e.g., `/api/v1/todos`) — industry standard
- [ ] Add `[Authorize]` attribute to protect endpoints

### Middleware
- [ ] **Global Exception Handling Middleware** — catch all unhandled exceptions, return structured JSON error (never expose stack traces to clients)
- [ ] **Request Logging Middleware** — log every incoming HTTP request
- [ ] **CORS Middleware** — allow Angular frontend to call the API

### Cross-Cutting Configuration
- [ ] Configure **JWT Authentication** in `Program.cs`
- [ ] Configure **Swagger/OpenAPI** with JWT auth support (lock icon in Swagger UI)
- [ ] Add **Health Check endpoint** (`/health`) — used by load balancers in production
- [ ] Add **Rate Limiting** — prevent abuse (e.g., max 100 requests/minute per IP)
- [ ] Implement `ICurrentUserService` using `IHttpContextAccessor`
- [ ] Configure `appsettings.json` with proper sections:
  - `ConnectionStrings`
  - `JwtSettings` (secret, issuer, expiry)
  - `CorsSettings`
- [ ] Create `appsettings.Development.json` for local overrides

### Logging
- [ ] Install `Serilog` + `Serilog.AspNetCore` + `Serilog.Sinks.Console` + `Serilog.Sinks.File`
- [ ] Configure structured logging (JSON format — readable by log aggregators like Datadog)

---

## 🧪 PHASE 5 — Testing

No professional project ships without tests. Tests are your safety net.

### Unit Tests (`TodoList.UnitTests`)
- [ ] Create new xUnit test project, add to solution
- [ ] Test every Command Handler
  - `CreateTodoCommandHandlerTests`
  - `DeleteTodoCommandHandlerTests`
  - etc.
- [ ] Test all FluentValidation validators
- [ ] Test domain entities (business rule logic)
- [ ] Use `Moq` or `NSubstitute` to mock dependencies (repositories, services)
- [ ] Aim for **≥80% code coverage** on Application layer

### Integration Tests (`TodoList.IntegrationTests`)
- [ ] Create new xUnit test project
- [ ] Install `Microsoft.AspNetCore.Mvc.Testing` (spins up a real test server)
- [ ] Install `Testcontainers.MsSql` (creates a real SQL Server in Docker for tests)
- [ ] Test full HTTP flows (API → Application → DB → Response)
  - `POST /api/v1/todos` creates a todo and returns 201
  - `GET /api/v1/todos` returns only the current user's todos
  - `DELETE /api/v1/todos/{id}` by non-owner returns 403 Forbidden

---

## 🎨 PHASE 6 — Angular Frontend (`TodoList.Web`)

### Architecture Setup
- [ ] Create a **feature-based folder structure**:
  ```
  src/app/
  ├── core/         (singleton services: auth, http interceptors)
  ├── shared/       (reusable components, pipes, directives)
  └── features/
      ├── auth/     (login, register pages)
      └── todos/    (todo list, todo detail)
  ```
- [ ] Create an `HttpInterceptor` to auto-attach JWT token to every API request
- [ ] Create an `HttpInterceptor` for global error handling (show toast on 500, redirect on 401)
- [ ] Create `AuthGuard` to protect routes that require login
- [ ] Set up `environment.ts` and `environment.prod.ts` for API base URL

### Auth Feature
- [ ] `LoginComponent` — login form (email + password)
- [ ] `RegisterComponent` — registration form
- [ ] `AuthService` — handles login/logout, stores JWT in `localStorage`

### Todos Feature
- [ ] `TodoListComponent` — displays all todos with filters (All / Active / Completed) and sort
- [ ] `TodoItemComponent` — single todo row with toggle, edit, delete actions
- [ ] `TodoFormComponent` — create/edit form (title, description, priority, due date)
- [ ] `TodoService` — wraps all HTTP calls to the API

### UI/UX Polish
- [ ] Set up PrimeNG theme in `styles.css`
- [ ] Create responsive layout with a proper Navbar
- [ ] Add loading skeletons while data is being fetched
- [ ] Add success/error toast notifications using PrimeNG's `ToastModule`
- [ ] Add confirmation dialog before deleting a todo
- [ ] Implement client-side pagination or infinite scroll
- [ ] Make the layout fully **responsive** (mobile-friendly)

### Angular Frontend Testing
- [ ] Unit test `AuthService`
- [ ] Unit test `TodoService`
- [ ] Component tests for `TodoListComponent` and `TodoFormComponent`

---

## 🔒 PHASE 7 — Security Hardening

Security is non-negotiable in a real company project.

- [ ] Verify passwords are **BCrypt hashed** — never stored as plain text
- [ ] JWT tokens expire (short-lived: e.g. 1 hour)
- [ ] Users can **only see/edit their own todos** (enforced in backend — never trust the frontend)
- [ ] SQL Injection impossible (EF Core parameterizes queries by default — verify)
- [ ] HTTPS enforced (already in `Program.cs`)
- [ ] No sensitive info in error responses (stack traces hidden in production)
- [ ] CORS locked to only the Angular app's domain

---

## 📦 PHASE 8 — DevOps & Project Hygiene

- [ ] Add `.NET API` to `docker-compose.yml` so the whole backend runs with one command
- [ ] Create a proper `README.md`:
  - What the project does
  - How to run it locally (prerequisites, commands)
  - Architecture diagram
  - API documentation link
- [ ] Add a `.gitignore` tuned for .NET + Angular (already partly there)
- [ ] Set up a **migration script** that runs on app startup in Development
- [ ] Add `Directory.Build.props` to enforce consistent .NET settings across all projects

---

## 📊 Priority Order (What to Build First)

```
Phase 1 (Domain)       ← Start here. No dependencies.
    ↓
Phase 2 (Application)  ← Business logic. Testable without a DB.
    ↓
Phase 3 (Infrastructure) ← Wire up the database.
    ↓
Phase 4 (API)          ← Expose HTTP endpoints. Test with Swagger.
    ↓
Phase 5 (Tests)        ← Write tests alongside or right after.
    ↓
Phase 6 (Frontend)     ← Build Angular once the API is stable.
    ↓
Phase 7+8 (Security & DevOps) ← Polish before "shipping".
```

---

## 📈 What Makes This "Real Company" Level

| Feature | Beginner Project | This Project |
|---|---|---|
| Architecture | Everything in one file | Clean Architecture (4 layers) |
| Data patterns | Direct DB calls | Repository pattern + CQRS |
| Authentication | None | JWT with BCrypt passwords |
| Validation | None or if-statements | FluentValidation pipeline |
| Error handling | try/catch everywhere | Global middleware, domain exceptions |
| Logging | `Console.WriteLine` | Structured Serilog with sinks |
| Testing | None | Unit + Integration tests |
| Database | Manual SQL | EF Core with migrations |
| Security | None | Auth, authorization, soft delete, rate limiting |
| Frontend | Vanilla JS | Angular + PrimeNG + Interceptors + Guards |
| Docs | None | Swagger/OpenAPI, README |
