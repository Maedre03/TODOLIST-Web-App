# 📓 Development Journal — TodoList Web App

> **Purpose**: Daily log of what was built, why decisions were made, and what was learned.
> This will be the source material for the final report (Day 1, Day 2, Day 3...).
>
> ℹ️ This file is kept up-to-date automatically by the AI assistant after each task batch is completed.

---

## 📅 Day 1 — 2026-07-17

### 🔀 Git Commits / Version
```
775d644 feat: implement Phase 4 API Layer structure (Controllers, Route versioning, Authorize)
bc79e98 feat: complete Phase 3 authentication with BCrypt and JwtBearer
d433b5a journal: Day 1 - phase 3 database layer implemented
93d9a27 feat: implement phase 3 database layer
8f124c8 journal: Day 1 - completed Phase 2
```

### ✅ Tasks Completed

**Project Setup**
- Initialized Git repository (`git init`)
- Created `.gitignore` (tuned for .NET + Angular)
- Set up Docker Compose for PostgreSQL database
- Created project folder structure (Backend: Clean Architecture 4-layer, Frontend: Angular)
- Created `task_list.md` — full professional task breakdown across 8 phases

**Phase 1 — Domain Layer (fully completed)**
- Defined `Todo` entity with all professional properties (GUID ID, audit fields, soft delete, ownership)
- Defined `User` entity
- Created abstract `Entity<TId>` base class (all entities inherit common fields)
- Defined `Priority` enum (Low / Medium / High)
- Defined `IDomainEvent` interface + `TodoCreatedEvent` domain event
- Defined `IRepository<T>` and `ITodoRepository` interfaces
- Defined custom Domain Exceptions (`TodoNotFoundException`, `UnauthorizedTodoAccessException`)

**Phase 2 — Application Layer (fully completed)**
- Installed `MediatR` NuGet package
- Set up MediatR dependency injection registration in `DependencyInjection.cs`
- Created `IUnitOfWork` and `ICurrentUserService` interfaces
- Implemented `CreateTodoCommand` and `CreateTodoCommandHandler`
- Implemented `UpdateTodoCommand` and `UpdateTodoCommandHandler`
- Implemented `DeleteTodoCommand` and `DeleteTodoCommandHandler`
- Implemented `ToggleTodoCompleteCommand` and `ToggleTodoCompleteCommandHandler`
- Created `IPasswordHasher` and `IJwtTokenService` interfaces
- Implemented `RegisterUserCommand` and `RegisterUserCommandHandler`
- Implemented `LoginUserCommand` and `LoginUserCommandHandler`
- Implemented `GetAllTodosQuery` and `GetAllTodosQueryHandler`
- Implemented `GetTodoByIdQuery` and `GetTodoByIdQueryHandler`
- Implemented `GetTodosPagedQuery` and `GetTodosPagedQueryHandler`
- Added `TodoDto`, `CreateTodoRequest`, `UpdateTodoRequest`, and `ApiResponse<T>`, `PaginatedList<T>` models
- Extended `ITodoRepository` with `GetPagedByUserIdAsync` for paginated queries
- Installed `FluentValidation.DependencyInjectionExtensions`
- Created `CreateTodoCommandValidator`, `UpdateTodoCommandValidator`, `RegisterUserCommandValidator`
- Created `ValidationBehavior` to wire FluentValidation into the MediatR pipeline automatically
- Added a custom `ValidationException` to encapsulate validation errors
- Installed AutoMapper and configured `TodoMappingProfile` and `UserMappingProfile`
- Added `LoggingBehavior` and `PerformanceBehavior` to the MediatR pipeline
- Created `IDateTimeProvider` interface for abstracting current time access

**Phase 3 — Infrastructure Layer (fully completed)**
- Created `ApplicationDbContext` (registers `Todos` and `Users`)
- Configured entity mappings using **Fluent API** (`TodoConfiguration`, `UserConfiguration`)
- Implemented **soft delete** by overriding `SaveChangesAsync` to set `IsDeleted = true`
- Implemented **automatic auditing** by auto-setting `CreatedAt` and `UpdatedAt` in `SaveChangesAsync`
- Dispatched Domain Events through MediatR after `SaveChangesAsync`
- Created `GenericRepository<T>` for base CRUD operations
- Implemented `TodoRepository` with specific `GetByUserIdAsync` and `GetPagedByUserIdAsync` logic
- Implemented `UserRepository` with specific email queries
- Created `DatabaseSeeder` for development data
- Successfully generated and applied the `InitialCreate` database migration to SQL Server on Docker
- Installed `BCrypt.Net-Next` and implemented `PasswordHasher` for secure password storage.
- Installed `Microsoft.AspNetCore.Authentication.JwtBearer` and implemented `JwtTokenService` using `Microsoft.IdentityModel.Tokens` to generate signed JWTs.

**Phase 4 — API Layer**
- Created `Controllers/` folder to manage HTTP endpoints.
- Implemented `TodosController` with full CRUD endpoints using MediatR.
- Implemented `AuthController` with register and login endpoints using MediatR.
- Implemented Route Versioning using `[Route("api/v1/[controller]")]` on all controllers to ensure API backward compatibility.
- Added `[Authorize]` attribute to `TodosController` to properly protect the endpoints.

### 🧠 Key Decisions & Why
- **GUID over int for IDs**: UUIDs are harder to guess (security), and avoid ID collisions in distributed systems. Industry standard.
- **Soft delete (`IsDeleted` flag)**: Real apps never permanently delete data — regulatory requirements, audit trails, accidental deletion recovery.
- **Clean Architecture (4 layers)**: Domain → Application → Infrastructure → API. Each layer only knows about the layer below it. This makes the code testable and swappable (e.g., swap SQL Server for PostgreSQL without touching business logic).
- **CQRS with MediatR**: Separates "reading" from "writing" operations. Each use case is its own class — easy to find, test, and modify independently.
- **Repository pattern**: Application layer defines interfaces (`ITodoRepository`), Infrastructure implements them. Application never touches EF Core directly.
- **IUnitOfWork abstraction**: Separated database commit logic (`SaveChangesAsync`) from repository query/add logic. Ensures commands can coordinate multiple changes in one transaction without bleeding EF Core into Application.
- **Authorization in Query**: In `UpdateTodoCommandHandler`, we fetch the Todo using `GetByIdAndUserAsync`. This enforces that users can only update their own items, addressing a key security requirement early in the Application layer.
- **Targeted Updates vs Full Updates**: Created a specific `ToggleTodoCompleteCommand` instead of forcing the frontend to use `UpdateTodoCommand` just to check a box. This is better for performance and intent-driven APIs.
- **Soft Delete in Repository**: `DeleteTodoCommandHandler` calls `_todoRepository.Delete()`. Following our project rules, this will be implemented as a soft delete (`IsDeleted = true`) inside the EF Core Infrastructure layer, keeping the Application layer completely agnostic of how deletion is stored.
- **Authentication Abstractions**: We defined `IPasswordHasher` and `IJwtTokenService` in the Application layer, but we DO NOT implement them here. The actual implementation (BCrypt, JWT Bearer) requires external libraries, which belongs in Infrastructure. This strictly enforces the Dependency Rule of Clean Architecture.
- **Domain Exceptions for Auth**: Created `EmailAlreadyInUseException` and `InvalidCredentialsException`. By using typed exceptions instead of generic ones or returning nulls, the API layer (Phase 4) can easily map these to HTTP 409 Conflict and HTTP 401 Unauthorized via global middleware.
- **Custom exceptions for missing data**: Created `TodoNotFoundException` instead of returning null or generic exceptions. This makes the code expressive and allows the API layer to map this to HTTP 404 globally.
- **Dedicated Response Wrappers**: Implemented `PaginatedList<T>` and `ApiResponse<T>` to encapsulate responses along with metadata (Success flag, TotalCount, TotalPages, Errors) to give the frontend all the data it needs for UI controls consistently across the API.
- **Repository-level Pagination**: Decided to add `GetPagedByUserIdAsync` to `ITodoRepository`. Filtering, sorting, and pagination must be handled in the database query (via the repository) rather than loading all items into application memory.
- **Separate Request DTOs**: Created `CreateTodoRequest` and `UpdateTodoRequest` instead of reusing MediatR commands as API payloads. This ensures the API payload contracts are decoupled from internal Application logic.
- **Validation Pipeline Behavior**: Integrated FluentValidation directly into MediatR using a pipeline behavior (`ValidationBehavior`). This ensures that every command is validated before it ever reaches the handler. This keeps the handlers clean and focused purely on business logic rather than validation checks. We also created a custom `ValidationException` to format these errors properly.
- **MediatR Pipeline Behaviors (Logging & Performance)**: Centralizing cross-cutting concerns (logging, performance) in MediatR behaviors prevents copy-pasting the same boilerplate code into every command handler.
- **AutoMapper Profiles**: Instead of manual property mapping in every handler, we configure declarative profiles to map Domain Entities to DTOs natively.
- **IDateTimeProvider abstraction**: Hardcoding `DateTime.UtcNow` makes code untestable. We injected `IDateTimeProvider` to easily mock time during testing.
- **EF Core Fluent API vs Data Annotations**: We chose to configure entities via `IEntityTypeConfiguration` rather than attributes on the Domain classes. This prevents the Domain layer from taking a dependency on Entity Framework, enforcing strict Clean Architecture.
- **Centralized Saving / SaveChangesAsync Overrides**: Implemented automatic soft delete logic and auditing (`CreatedAt`, `UpdatedAt`) inside `ApplicationDbContext.SaveChangesAsync` rather than requiring each repository method to handle it. This ensures it's impossible for developers to forget to set audit fields.
- **Domain Event Dispatching in DbContext**: Before saving changes, `ApplicationDbContext` pulls events from entities and publishes them through MediatR. This allows decoupling cross-cutting actions (like sending an email when a Todo is created) from the core handler logic.
- **Dummy Implementations for Auth Services**: Created `CurrentUserService` and `PasswordHasher` shells to satisfy MediatR dependency requirements for the handlers until we install BCrypt and integrate JWTs.
- **Thin Controllers**: The controllers (`TodosController`, `AuthController`) contain practically no logic. They simply construct MediatR commands/queries from HTTP requests and send them. This ensures the business logic remains strictly in the Application layer, making the controllers easy to test and maintain.
- **Route Versioning (`/api/v1/`)**: Including versioning in the API routes from the start is an industry standard practice that prevents breaking clients when major API changes are required in the future.

### ⚠️ Problems / Blockers
- *(None today)*

### 📌 Tomorrow / Next Session
- [ ] Phase 4 — API Layer Middlewares (Global Exception Handling, Request Logging, CORS)

---

<!-- ============================================================ -->
<!-- TEMPLATE FOR NEW DAYS — copy the block below for each new day -->
<!-- ============================================================

## 📅 Day N — YYYY-MM-DD

### 🔀 Git Commits / Version
```
(run: git log --oneline -5 and paste here)
```

### ✅ Tasks Completed
- Phase X — item description

### 🧠 Key Decisions & Why
- **Decision**: Reason and context...

### ⚠️ Problems / Blockers
- Problem encountered: How you solved it

### 📌 Tomorrow / Next Session
- [ ] Next planned task...

-->
