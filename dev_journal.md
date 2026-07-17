# 📓 Development Journal — TodoList Web App

> **Purpose**: Daily log of what was built, why decisions were made, and what was learned.
> This will be the source material for the final report (Day 1, Day 2, Day 3...).
>
> ℹ️ This file is kept up-to-date automatically by the AI assistant after each task batch is completed.

---

## 📅 Day 1 — 2026-07-17

### 🔀 Git Commits / Version
```
2f9a1a8 feat: add RegisterUserCommand and LoginUserCommand with auth interfaces
e518f7e journal: Day 1 — Delete and Toggle commands implemented
121701e feat: add DeleteTodoCommand and ToggleTodoCompleteCommand
2eb6e69 journal: Day 1 — UpdateTodoCommand implemented
81407fe feat: add UpdateTodoCommand and handler
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

**Phase 2 — Application Layer (started)**
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

### ⚠️ Problems / Blockers
- *(None today — fill in any issues you hit)*

### 📌 Tomorrow / Next Session
- [ ] Start on Queries (GetAllTodos, GetTodoById, GetTodosPaged)
- [ ] Start on DTOs and FluentValidation

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
