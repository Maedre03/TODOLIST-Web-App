# Project Rules — TodoList Web App

## 📓 Development Journal (MANDATORY)

This project maintains a `dev_journal.md` in the project root. Every AI assistant working on this project **must** follow these rules:

### At the Start of Every Session
1. Read `dev_journal.md` to understand what has already been done and what day we are on.
2. Read `task_list.md` to understand which tasks are completed (`[x]`) and which are pending.

### After Completing Any Meaningful Batch of Work
After finishing a task or group of tasks, you MUST do ALL of the following — no exceptions:

#### Step 1 — Commit & push all code changes
```bash
git add .
git commit -m "<type>: <short description of what was built>"
git push origin main
```
Use conventional commit prefixes:
- `feat:` — new feature or implementation (e.g. `feat: add CreateTodoCommandHandler`)
- `fix:` — bug fix
- `refactor:` — code restructure with no behaviour change
- `chore:` — config, tooling, dependencies (e.g. `chore: install FluentValidation`)
- `test:` — adding or updating tests
- `docs:` — documentation only

Never leave uncommitted code at the end of a task batch.

#### Step 2 — Update `task_list.md`
Mark every completed item with `[x]`. Stage and include in the next commit.

#### Step 3 — Update `dev_journal.md`
   - If it is still the same calendar day as the last entry, add to that day's entry.
   - If it is a new calendar day, create a new `## 📅 Day N — YYYY-MM-DD` section by incrementing N.
   - Run `git log --oneline -5` and fill in the "Git Commits / Version" section with real hashes.
   - Record every task completed under "✅ Tasks Completed".
   - Fill in "🧠 Key Decisions & Why" — explain *why* each technical decision was made, not just what was done. This is the most important part for the final report.
   - Fill in "⚠️ Problems / Blockers" if anything was difficult or unexpected.
   - Update "📌 Tomorrow / Next Session" with the next pending tasks from `task_list.md`.

#### Step 4 — Commit & push the journal
```bash
git add dev_journal.md task_list.md
git commit -m "journal: Day N — brief description of what was done"
git push origin main
```

### Journal Entry Template (for new days)
```markdown
## 📅 Day N — YYYY-MM-DD

### 🔀 Git Commits / Version
```
(paste: git log --oneline -5)
```

### ✅ Tasks Completed
- Phase X — description of what was done

### 🧠 Key Decisions & Why
- **Decision name**: Why this approach was chosen, what problem it solves, industry reasoning

### ⚠️ Problems / Blockers
- Problem: How it was resolved

### 📌 Tomorrow / Next Session
- [ ] Next planned task from task_list.md

---
```

---

## 🏗️ Architecture Rules — Clean Architecture (NEVER VIOLATE)

This project follows strict Clean Architecture. Layer dependency direction is **one-way only**:
```
Domain ← Application ← Infrastructure ← API
```

### Layer Boundaries
- **Domain** (`TodoList.Domain`): Zero external NuGet dependencies. No EF Core, no MediatR, no HTTP. Pure C# only.
- **Application** (`TodoList.Application`): Depends on Domain only. Defines interfaces — never implements them. No EF Core `DbContext`, no SQL, no HTTP.
- **Infrastructure** (`TodoList.Infrastructure`): Implements interfaces from Application. The ONLY layer that knows about EF Core, SQL, BCrypt, JWT signing.
- **API** (`TodoList.Api`): Depends on Application only (via DI). Never calls repositories directly. Always goes through MediatR.

### Forbidden Cross-Layer References
- ❌ Domain must NEVER reference Application, Infrastructure, or API projects
- ❌ Application must NEVER reference Infrastructure or API projects
- ❌ API controllers must NEVER `new` up repository or service classes directly
- ❌ API controllers must NEVER contain business logic — delegate everything to MediatR

---

## ⚙️ CQRS & MediatR Rules

- Every use case = one Command or Query class + one Handler class, in the same folder
- **Commands** mutate state. **Queries** are read-only — never modify data inside a query handler
- All commands/queries must implement `IRequest<T>` from MediatR
- Handlers must implement `IRequestHandler<TRequest, TResponse>`
- Never call another handler from inside a handler — use shared services instead
- Pipeline behaviors (Validation, Logging, Performance) are registered in `DependencyInjection.cs` in Application — never inline in handlers

### Folder Structure for Application Layer
```
Application/
├── Features/
│   ├── Todos/
│   │   ├── Commands/
│   │   │   ├── CreateTodo/
│   │   │   │   ├── CreateTodoCommand.cs
│   │   │   │   ├── CreateTodoCommandHandler.cs
│   │   │   │   └── CreateTodoCommandValidator.cs
│   │   └── Queries/
│   │       └── GetAllTodos/
│   │           ├── GetAllTodosQuery.cs
│   │           └── GetAllTodosQueryHandler.cs
│   └── Auth/
│       └── Commands/
├── Common/
│   ├── Behaviors/         (ValidationBehavior, LoggingBehavior, PerformanceBehavior)
│   ├── DTOs/
│   ├── Exceptions/
│   └── Interfaces/        (ICurrentUserService, IDateTimeProvider, IJwtTokenService)
└── DependencyInjection.cs
```

---

## 🗄️ Database & EF Core Rules

- **NEVER write raw SQL** — always use EF Core LINQ queries
- **NEVER hard-delete** — always use soft delete (`IsDeleted = true`). The `Delete()` method in the repository sets `IsDeleted`, it does NOT call `DbContext.Remove()`
- **ALL entity configurations go in Fluent API** (`IEntityTypeConfiguration<T>`) — never use data annotations (`[Required]`, `[MaxLength]`) on entity classes
- **NEVER call `DbContext` from Application layer** — only repositories (injected via interface) are allowed
- When adding a new entity, always:
  1. Create the entity class in `TodoList.Domain/Entities/` inheriting from `Entity<Guid>`
  2. Create an `IEntityRepository` interface in `TodoList.Domain/Repositories/`
  3. Create an `EntityConfiguration` class in Infrastructure using Fluent API
  4. Register it in `ApplicationDbContext`
  5. Create a new EF Core migration (`dotnet ef migrations add <Name>`)
- `CreatedAt` and `UpdatedAt` are set automatically in `SaveChangesAsync` — never set them manually in handlers

### Running Migrations
```bash
# Always ensure Docker is running first:
docker-compose up -d

# Then add and apply migration:
cd src/TodoList.Infrastructure
dotnet ef migrations add <MigrationName> --startup-project ../TodoList.Api
dotnet ef database update --startup-project ../TodoList.Api
```

---

## 🔒 Security Rules (HARD RULES — NEVER SKIP)

- **NEVER store plain text passwords** — always BCrypt hash via `IPasswordHasher`
- **NEVER put secrets in code or appsettings.json** — use `appsettings.Development.json` (gitignored) or environment variables
- **NEVER trust the frontend** for ownership — always verify `CreatedByUserId == currentUserId` in the backend handler before modifying a todo
- **NEVER expose stack traces** in API error responses in production — global exception middleware returns only structured JSON
- JWT tokens must have expiry configured (`JwtSettings:ExpiryMinutes` in config)
- CORS must be locked to the Angular app's origin — not wildcard `*` in production

---

## 🌐 API Layer Rules

- Controllers are **thin** — they only: receive HTTP request → send MediatR command/query → return HTTP response
- All endpoints must be under `/api/v1/` route prefix
- All endpoints (except `/auth/register` and `/auth/login`) must have `[Authorize]`
- Return proper HTTP status codes:
  - `201 Created` for POST (create)
  - `204 No Content` for DELETE
  - `404 Not Found` when entity doesn't exist (throw `TodoNotFoundException` in handler, let middleware map it)
  - `403 Forbidden` when user tries to access another user's todo
- Never return the full entity — always return a DTO

---

## 🧪 Testing Rules

- Every Command Handler must have a corresponding unit test class: `<HandlerName>Tests.cs`
- Test naming convention: `MethodName_StateUnderTest_ExpectedBehavior`
  - Example: `Handle_WhenTodoNotFound_ThrowsTodoNotFoundException`
- Always mock dependencies with `NSubstitute` or `Moq` — never use real EF Core in unit tests
- Use `IDateTimeProvider` (not `DateTime.UtcNow` directly) so tests can control time
- Integration tests use `Testcontainers` for a real SQL Server — never share state between tests

---

## 🎨 Angular Frontend Rules

- **Never make HTTP calls from components** — always go through a service (`TodoService`, `AuthService`)
- **Always unsubscribe** from observables in components (use `takeUntilDestroyed()` or `async` pipe)
- Use **Reactive Forms** (`FormGroup`, `FormControl`) — never template-driven forms for this project
- JWT is stored in `localStorage` and attached to every request via the `AuthInterceptor` — never manually add `Authorization` headers in services
- Always use `AuthGuard` on protected routes — never rely on hiding UI elements as security
- Feature modules follow the structure: `features/<feature>/components/`, `features/<feature>/services/`, `features/<feature>/models/`
- Use PrimeNG components for UI — do not mix with other UI libraries

---

## 📝 Code Style & Quality Rules

- **Always use `async/await`** — never block with `.Result` or `.Wait()` (causes deadlocks)
- **Always pass `CancellationToken`** down to all async methods (repository calls, DB calls)
- Write XML doc comments (`/// <summary>`) on all public classes and methods — this is a learning/reporting project
- Use `string.Empty` instead of `""` for empty string initialization
- Never use `var` when the type is not immediately obvious from the right-hand side
- Always handle `null` explicitly — this project uses C# nullable reference types

---

## 🐳 Docker & Environment Rules

- PostgreSQL runs in Docker via `docker-compose.yml` — always run `docker-compose up -d` before starting the API or running migrations
- Connection string is in `appsettings.Development.json` (not committed) — use the template in `appsettings.json`
- Never change `docker-compose.yml` without updating the README instructions

---

## General Project Rules
- This is a professional-grade .NET Clean Architecture + Angular project. Follow industry best practices.
- Backend: ASP.NET Core Web API with Clean Architecture (Domain → Application → Infrastructure → API).
- Frontend: Angular with PrimeNG.
- Database: SQL Server via Docker Compose (defined in `docker-compose.yml`).
- Always explain architectural decisions in code comments or journal — this is a learning/reporting project.
- Follow `task_list.md` phase order — do not skip phases or implement Infrastructure before Application interfaces are defined.
