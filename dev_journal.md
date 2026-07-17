# 📓 Development Journal — TodoList Web App

> **Purpose**: Daily log of what was built, why decisions were made, and what was learned.
> This will be the source material for the final report (Day 1, Day 2, Day 3...).
>
> ℹ️ This file is kept up-to-date automatically by the AI assistant after each task batch is completed.

---

## 📅 Day 1 — 2026-07-17

### 🔀 Git Commits / Version
```
81407fe feat: add UpdateTodoCommand and handler
9f5d67f journal: Day 1 — CreateTodoCommand implemented
4ca75b4 feat: add CreateTodoCommand and handler, IUnitOfWork, ICurrentUserService
f0f6c5a chore: expand project rules — architecture, security, DB, testing, Angular, code style
3e3d560 chore: update project rules — mandatory git commit+push after every task batch
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

### 🧠 Key Decisions & Why
- **GUID over int for IDs**: UUIDs are harder to guess (security), and avoid ID collisions in distributed systems. Industry standard.
- **Soft delete (`IsDeleted` flag)**: Real apps never permanently delete data — regulatory requirements, audit trails, accidental deletion recovery.
- **Clean Architecture (4 layers)**: Domain → Application → Infrastructure → API. Each layer only knows about the layer below it. This makes the code testable and swappable (e.g., swap SQL Server for PostgreSQL without touching business logic).
- **CQRS with MediatR**: Separates "reading" from "writing" operations. Each use case is its own class — easy to find, test, and modify independently.
- **Repository pattern**: Application layer defines interfaces (`ITodoRepository`), Infrastructure implements them. Application never touches EF Core directly.
- **IUnitOfWork abstraction**: Separated database commit logic (`SaveChangesAsync`) from repository query/add logic. Ensures commands can coordinate multiple changes in one transaction without bleeding EF Core into Application.
- **Authorization in Query**: In `UpdateTodoCommandHandler`, we fetch the Todo using `GetByIdAndUserAsync`. This enforces that users can only update their own items, addressing a key security requirement early in the Application layer.

### ⚠️ Problems / Blockers
- *(None today — fill in any issues you hit)*

### 📌 Tomorrow / Next Session
- [ ] `DeleteTodoCommand` + `DeleteTodoCommandHandler`
- [ ] `ToggleTodoCompleteCommand` + Handler
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
