# 📓 Development Journal — TodoList Web App

> **Purpose**: Daily log of what was built, why decisions were made, and what was learned.
> This will be the source material for the final report (Day 1, Day 2, Day 3...).
>
> ℹ️ This file is kept up-to-date automatically by the AI assistant after each task batch is completed.

---

## 📅 Day 1 — 2026-07-17

### 🔀 Git Commits / Version
```
b1c4dc6 feat: implement Phase 6.4 Todos UI (TodoList, TodoItem, TodoForm with PrimeNG Select/Dialog/Paginator)
a03477e feat: implement Phase 6.3 Auth UI with premium split-screen design
81d18af feat: implement Phase 6.2 Angular shared components and layout (AppLayout, PriorityBadge, EmptyState, LoadingSkeleton)
a297ada feat: implement Phase 6.1 Angular frontend foundation (services, interceptors, guards, design system)
508aa95 journal: Day 1 - update with application test coverage metrics
```

### ✅ Tasks Completed

**Project Setup**
- Initialized Git repository (`git init`)
- Created `.gitignore` (tuned for .NET + Angular)
- Set up Docker Compose for PostgreSQL database
- Updated Docker Compose to use `azure-sql-edge` for Mac ARM64 compatibility
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

**Phase 4 — API Layer (fully completed)**
- Created `Controllers/` folder to manage HTTP endpoints.
- Implemented `TodosController` with full CRUD endpoints using MediatR.
- Implemented `AuthController` with register and login endpoints using MediatR.
- Implemented Route Versioning using `[Route("api/v1/[controller]")]` on all controllers to ensure API backward compatibility.
- Added `[Authorize]` attribute to `TodosController` to properly protect the endpoints.
- Implemented `ExceptionHandlingMiddleware` to catch all unhandled exceptions and convert them to standard JSON `ApiResponse<T>` objects based on the exception type.
- Implemented `RequestLoggingMiddleware` to manually track and log HTTP method, path, and execution time.
- Configured `CORS Middleware` in `Program.cs` to lock down requests strictly from the `http://localhost:4200` Angular frontend.
- Configured **JWT Authentication** in `Program.cs` to enforce bearer token validation using settings from `appsettings.json`.
- Configured **Swagger/OpenAPI** to support JWT authorization by adding security definitions (lock icon) to test protected endpoints directly.
- Added a **Health Check endpoint** (`/health`) to allow external monitoring systems to check API availability.
- Set up **Rate Limiting** via `PartitionedRateLimiter.Create<HttpContext, string>` to prevent abuse, allowing max 100 requests per minute per IP.
- Implemented a real `CurrentUserService` using `IHttpContextAccessor` inside the API layer, dropping the dummy implementation from Infrastructure.
- Configured `appsettings.json` and `appsettings.Development.json` with dedicated sections (`ConnectionStrings`, `JwtSettings`, `CorsSettings`, `Serilog`).
- Integrated **Serilog** for structured logging (writing to both Console and File with compact JSON formatting).

**Phase 5 — Testing (Unit Tests)**
- Created `TodoList.UnitTests` xUnit project and integrated it into the solution via `TodoList.slnx`.
- Added `NSubstitute`, `FluentAssertions`, and `coverlet.msbuild` for mocking, assertions, and code coverage.
- Implemented unit tests for all domain entities (`TodoTests`, `UserTests`), validating constructor invariants and domain event registration.
- Implemented tests for all FluentValidation validators (`CreateTodoCommandValidatorTests`, `UpdateTodoCommandValidatorTests`, `RegisterUserCommandValidatorTests`).
- Implemented tests for all Command Handlers (`CreateTodoCommandHandler`, `UpdateTodoCommandHandler`, `DeleteTodoCommandHandler`, `ToggleTodoCompleteCommandHandler`, `LoginUserCommandHandler`, `RegisterUserCommandHandler`), mocking out repository and service dependencies.
- Implemented tests for all Query Handlers (`GetAllTodosQueryHandler`, `GetTodoByIdQueryHandler`, `GetTodosPagedQueryHandler`).
- Achieved ~70% overall code coverage on the Application layer initially, successfully testing all core business logic paths.
- Increased test coverage on the Application layer to 86.3% by testing all MediatR pipeline behaviors (`LoggingBehavior`, `ValidationBehavior`, `PerformanceBehavior`).

**Phase 5 — Testing (Integration Tests)**
- Created `TodoList.IntegrationTests` xUnit project.
- Configured `Testcontainers.SqlEdge` to automatically spin up a real `azure-sql-edge` Docker container during test runs.
- Overrode the application's `DbContext` in `CustomWebApplicationFactory` to seamlessly point to the Testcontainer instance.
- Implemented true end-to-end HTTP tests (`TodosControllerTests`) that hit the API, write to the real database, and assert on HTTP response codes (201 Created, 403 Forbidden).
- Discovered and fixed a security bug in `DeleteTodoCommandHandler`: changed it to fetch via `GetByIdAsync` and explicitly throw `UnauthorizedTodoAccessException` (mapping to 403) instead of blindly returning 404 Not Found when a user tries to delete another user's todo.

**Phase 6 — Frontend Setup (Angular & PrimeNG)**
- Implemented `AuthService` and `TodoService` to manage HTTP calls using signals for state.
- Configured functional HTTP interceptors (`auth.interceptor`, `error.interceptor`).
- Configured functional guards (`auth.guard`, `guest.guard`).
- Built the main application shell `AppLayoutComponent` with responsive sidebar and top bar.
- Developed shared UI components (`PriorityBadgeComponent`, `EmptyStateComponent`, `LoadingSkeletonComponent`).
- Designed a split-screen premium SaaS authentication flow for `LoginComponent` and `RegisterComponent` using Reactive Forms.
- Built the complete `TodoListComponent` managing paginated state from the backend.
- Developed `TodoItemComponent` with checkboxes, priority badges, and an action menu.
- Developed `TodoFormComponent` in a PrimeNG Dialog using the new `p-select` for priority management.

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
- **MediatR INotification Wrapper**: Rather than adding the MediatR NuGet package to our `TodoList.Domain` project (which would violate Clean Architecture's zero-dependency rule), we created a generic `DomainEventNotification<T>` wrapper in the Application Layer to securely publish `IDomainEvent`s as `INotification`s when `SaveChanges` is called.
- **Dummy Implementations for Auth Services**: Created `CurrentUserService` and `PasswordHasher` shells to satisfy MediatR dependency requirements for the handlers until we install BCrypt and integrate JWTs.
- **Thin Controllers**: The controllers (`TodosController`, `AuthController`) contain practically no logic. They simply construct MediatR commands/queries from HTTP requests and send them. This ensures the business logic remains strictly in the Application layer, making the controllers easy to test and maintain.
- **Route Versioning (`/api/v1/`)**: Including versioning in the API routes from the start is an industry standard practice that prevents breaking clients when major API changes are required in the future.
- **Global Exception Handling Middleware**: Instead of wrapping every controller action in a `try-catch` block, we catch exceptions globally. We map our custom domain exceptions to specific HTTP status codes (404 for NotFound, 400 for Validation, 403 for Forbidden) and never leak a 500 stack trace to the client.
- **CORS locked down**: In a production environment, wildcard CORS `*` is a security risk. We explicitly bound CORS to only allow the Angular development server (`http://localhost:4200`).
- **CurrentUserService moved to API Layer**: Retrieving the current user's ID requires reading the JWT token from the `HttpContext` via `IHttpContextAccessor`. Since the Infrastructure layer shouldn't know about HTTP, we deleted the dummy implementation in Infrastructure and placed the real implementation directly in the API project. This adheres strictly to Clean Architecture boundaries.
- **Rate Limiting built-in**: Before .NET 7, third-party libraries were required for rate limiting. We utilized the native `Microsoft.AspNetCore.RateLimiting` to partition limits by client IP address, drastically reducing the risk of denial of service or brute force attacks against our login endpoint.
- **Structured JSON Logging with Serilog**: Default .NET console logging is plain text, which is hard to search in DataDog or Kibana. By wiring up Serilog to output Compact JSON, every log message automatically includes parsed fields (like `RequestId` and `ExecutionTime`) making them fully searchable and observable.
- **Mocking with NSubstitute over Moq**: NSubstitute's syntax (`Substitute.For<T>()`, `.Returns()`) is much cleaner and closer to natural language compared to Moq's `.Setup()` and `.Object` syntax.
- **FluentAssertions for Readability**: Using `.Should().Be()` instead of standard `Assert.Equal()` makes tests read like plain English, reducing cognitive load when reading test failures.
- **Isolating the Application Layer**: Handlers were tested in complete isolation. We did not use an in-memory database, which is often an anti-pattern for unit tests. Instead, we mocked `ITodoRepository` and `IUnitOfWork` to strictly test the business flow (CQRS) and ensure tests execute in milliseconds.
- **Testcontainers over In-Memory DB**: For integration tests, we used Testcontainers to spin up a real SQL Server inside Docker. In-Memory databases behave differently than real relational databases (e.g., they don't enforce foreign keys or unique constraints). Testcontainers ensures our tests are incredibly accurate to production behavior.
- **Behavior Testing**: Testing pipeline behaviors like `ValidationBehavior` ensures that no unvalidated request reaches the handler, and by testing them independently we achieve high coverage across all requests without duplicating validation tests inside individual handlers.
- **Smart/Dumb Component Pattern**: Separated the frontend into orchestrator components (`TodoListComponent`) and presentational components (`TodoItem`, `TodoForm`) to maximize reusability and maintainability.
- **Angular Signals**: Used Angular's modern `signal<T>` approach instead of traditional properties or NgRx for lightweight, highly reactive local state management within the Todo list.
- **Split-Screen Auth UI**: Implemented a modern SaaS design pattern for authentication pages where marketing/branding occupies half the screen, providing a premium user experience from first contact.
- **Functional Interceptors and Guards**: Used the modern Angular approach (functions instead of classes) for router guards and HTTP interceptors to reduce boilerplate and align with Angular 15+ best practices.

### ⚠️ Problems / Blockers
- **Swashbuckle / .NET 10 OpenApi Conflict**: ASP.NET Core 9/10 includes built-in OpenAPI schema generation (`Microsoft.AspNetCore.OpenApi`), but this conflicts with `Swashbuckle.AspNetCore` because of shared namespaces. I downgraded Swashbuckle to `6.5.0` and removed `Microsoft.AspNetCore.OpenApi` to fix the build errors.
- **MediatR 500 Error on Create**: Swagger threw a 500 Internal Server Error when creating Todos because pure domain events (`IDomainEvent`) didn't implement MediatR's `INotification` interface. Fixed by adapting them into `DomainEventNotification<T>` dynamically during DbContext save.
- **AMD64 Docker Crash on Apple Silicon**: The standard SQL Server container `mcr.microsoft.com/mssql/server:2022-latest` crashed silently on the M-series Mac due to architecture mismatch (ARM64 vs AMD64). Resolved by switching the Docker image to `mcr.microsoft.com/azure-sql-edge:latest`, wiping the corrupt volume, and re-applying migrations.
- **Testcontainers ms-sql image incompatibility**: The standard `Testcontainers.MsSql` package expects the `sqlcmd` binary to be present to check readiness. This binary is missing in `azure-sql-edge`. We resolved this by switching our NuGet dependency to `Testcontainers.SqlEdge` which utilizes a tailored `SqlEdgeBuilder` that successfully manages the startup without relying on `sqlcmd`.

### 📌 Tomorrow / Next Session
- [ ] Manual verification of Phase 6 UI flows in Safari
- [ ] Phase 6.5 — Routing & Wiring
- [ ] Phase 7 — Advanced Features (optional polish)

---

## 📅 Day 2 — 2026-07-20

### 🔀 Git Commits / Version
```
1016d29 fix: adjust kanban column min-width to fit screen without scrolling
85d0ae6 journal: Day 2 - verify and complete phase 7 security hardening
df48839 journal: Day 2 - record phase 6 frontend test completion
b1110c4 test: add vitest unit tests for angular services and components
b1caf54 journal: Day 2 - record sidebar collapsible features
```

### ✅ Tasks Completed
- **Phase 9.4 — Kanban Board Layout Fix:** Adjusted `.kanban-column` `min-width` to `0`, ensuring the columns shrink proportionally and eliminating the horizontal scrollbar on smaller screens.
- **Phase 7 — Security Hardening:** Verified that all 7 security requirements (BCrypt hashing, JWT expiration, User ownership enforcement, SQL Injection prevention via EF Core, HTTPS redirection, Generic error responses for 500s, CORS lock down) were already implemented correctly during earlier phases. Marked them as complete in `task_list.md`.
- **Bug Fix**: Aligned Priority enum values between the frontend and backend to fix 'Low' priority creation issues, and introduced 'Critical' priority to the frontend UI including the Kanban board.
- Removed CSS hack and activated the official PrimeUI Community License.
- **Phase 9.1 — Critical UI Bug Fixes:**
  - Deleted unused `app.component.html` placeholder to reduce noise.
  - Fixed mobile sidebar logic by adding `isMobileMenuOpen` signal and responsive backdrop overlay.
  - Made `isMobile()` reactive to window resizing.
  - Replaced deprecated `p-input-icon-left` with modern `p-iconField` from PrimeNG v18.
- **Phase 9.2 — Due Date Feature:**
  - Added PrimeNG `p-datepicker` to `TodoFormComponent` for setting due dates.
  - Updated `TodoItemComponent` to display the due date.
  - Implemented an `isOverdue` check that adds a red CSS pulse animation and red text to overdue tasks.
- **Phase 9.3 — Sidebar Redesign:**
  - Built out entirely new UI sections for the sidebar: Today's Progress ring, Upcoming dates, Tags, and Pinned Tasks.
  - Created a new `ThemeService` using Angular `signal` and `effect` to handle Light/Dark mode toggles and local storage persistence.
  - Added theme toggle buttons to the sidebar footer.
- **Phase 9.4 — Todo List Page Redesign:**
  - Installed `@angular/cdk` to utilize `DragDropModule`.
  - Replaced the previous dropdown/sidebar filters with a horizontal `Tab Bar` inside the list view (All, Active, Completed, Overdue).
  - Implemented a Kanban Board view, grouping tasks by Priority columns (High, Medium, Low).
  - Added drag-and-drop support to re-prioritize tasks across Kanban columns seamlessly (with optimistic UI updates via API calls).
  - Constrained the Floating Action Button (FAB) to be visible only on mobile screens (`md:hidden`).
- **Phase 9.5 — Task Card Redesign:**
  - Replaced the standalone badge component in the footer with a small inline priority badge next to the task title.
  - Added a thick colored left border (Red/Yellow/Blue) to instantly identify task priority.
  - Added a subtle background tint gradient for High Priority tasks to make them stand out further.
- **Phase 9.6 — Auth Pages Enhancements:**
  - Enriched the split-screen layout on `LoginComponent` and `RegisterComponent`.
  - Added a high-conversion feature bullet list to the branding section.
  - Added a glassmorphic "Stats Counter" container showing mock metrics (Active Users, Tasks Done, Uptime) to increase perceived product value.
- **Phase 9.7 — Polish:**
  - Defined explicit `:root.light-mode` overrides in `styles.css` ensuring full contrast and theme toggle support.
  - Enhanced the `EmptyStateComponent` with a subtle gradient background and a glowing box-shadow for a more premium default state.
- **Bug Fix**: Fixed validation rules in `CreateTodoCommandValidator` and `UpdateTodoCommandValidator` to only check the `.Date` portion instead of comparing exact UTC timestamps, which previously blocked creating tasks for the same day.
- **Unit Test Fix**: Addressed a signature mismatch in `GetTodosPagedQueryHandlerTests` by supplying the `IsCompleted` query flag to the mocked repository method to resolve a compile error.
- **Frontend UI Enhancements**:
  - Upgraded the `p-datepicker` in `TodoFormComponent` with `[showTime]="true" hourFormat="24"` so users can optionally select a specific time for their tasks.
  - Implemented an `isDueSoon` logic in `TodoItemComponent` to add an animated "Requires attention" red exclamation icon next to the task title when the task is critical or due within the next 24 hours.
  - Updated the date pipe in `TodoItemComponent` to show the full time (`HH:mm`) alongside the date so users can visualize exact deadlines.
- **Bug Fix (Timezone Shift)**: Configured a global EF Core Value Converter in `ApplicationDbContext` to explicitly set `DateTimeKind.Utc` on all DateTime properties retrieved from the database. Added a robust frontend fallback in `TodoService` via RxJS `map` to intercept incoming dates and forcefully append the 'Z' (UTC indicator) if it's missing, ensuring the UI converts them to local time flawlessly even without backend restarts.
- **Bug Fix (Overdue Evaluation)**: Removed `.setHours(0,0,0,0)` constraints from the `isOverdue` logic across `TodoItemComponent` and `TodoListComponent`, ensuring that overdue checks evaluate down to the exact minute rather than waiting until the next calendar day.
- **UI Tweaks**: 
  - Modified `TodoItemComponent` to always display the "Created" date, rather than hiding it when a "Due" date is present, providing full temporal context to the user.
  - Replaced the invalid `pi-table-columns` PrimeIcon on the Kanban view switcher with the widely supported `pi-th-large` grid icon to fix the empty-box rendering bug.
  - Fixed a missing search icon within the `TodoListComponent` by explicitly nesting an `<i>` tag inside `<p-inputicon>`, resolving a PrimeNG v18 component projection bug where the `styleClass` attribute failed to render the glyph.
- **Sidebar UX Update**: Refactored sidebar feature sections (Tags, Pinned, Upcoming, Progress) into interactive, collapsible directories that apply query parameters to simulate site-specific navigation.
- **Phase 6.6 — Angular Frontend Testing**:
  - Implemented unit tests for `AuthService` covering login, logout, and token management using `HttpTestingController`.
  - Implemented unit tests for `TodoService` verifying CRUD operations and proper HTTP params building for pagination.
  - Implemented component tests for `TodoListComponent` ensuring accurate state updates on load, optimistic updates for toggling complete, and proper filtering.
  - Implemented component tests for `TodoFormComponent` validating form initialization for both create and edit modes, and correct `EventEmitter` payload emissions.
  - Mocked global `localStorage` explicitly to ensure Vitest environment runs correctly in Node without jsdom friction.

### 🧠 Key Decisions & Why
- **Responsive Kanban Layout**: Adjusted Kanban column scaling by removing explicit `min-width: 300px` in favor of `min-width: 0` inside the flex container. This ensures flex items can shrink properly when screen real-estate is limited, avoiding horizontal scrolling while maintaining proportional column widths.
- **Security by Default**: Due to the adherence to Clean Architecture and modern .NET practices in the earlier phases, the security hardening tasks (Phase 7) were naturally fulfilled without requiring retrofits. Using MediatR handlers with `_currentUserService.UserId` and `EF Core` parameterization ensures security is baked into the foundation.
- **Official License Configuration**: Removed the temporary CSS `.p-license` overrides in `styles.css` and injected the official PrimeUI Community License key directly into the `providePrimeNG` configuration block in `app.config.ts`. This is the architecturally correct way to handle PrimeNG v18+ commercial components, ensuring full compliance and preventing any hydration or rendering issues that CSS hacks might cause.
- **Reactive Mobile View:** We replaced the static `window.innerWidth` check with an `@HostListener('window:resize')` and proper signal usage in `AppLayoutComponent`. This ensures layout accurately reflects desktop/mobile state without requiring page reloads.
- **PrimeNG IconField API:** Shifted to `<p-iconField>` and `<p-inputIcon>` wrapper to remain compliant with PrimeNG 18, ensuring we don't carry technical debt from v17 patterns.
- **Due Date UX:** Used a simple CSS keyframe pulse animation for overdue indicators. This provides immediate visual urgency without relying on heavy JS animations. We reset hours on the date comparison in `isOverdue` to ensure tasks due today don't prematurely trigger the overdue state.
- **Mocked Feature Skeletons:** We scaffolded the UI for Tags, Pinned tasks, and Progress using static HTML. This allows us to finalize the visual redesign first, enabling rapid frontend iterations before investing in the required backend domain and CQRS changes.
- **Kanban Drag-and-Drop:** Implemented optimistic UI updates for moving items between Kanban columns. If the underlying `todoService.update` HTTP call fails, the UI is immediately reverted back to its original state, ensuring UI consistency without stalling the user experience on loading spinners.
- **Micro-Visuals for Priority:** Moved priority indicators from a bulky bottom badge to the left border and title line. This aligns with modern SaaS design, reducing vertical card height and allowing users to scan priority instantly by looking down the left edge of the list.
- **SaaS Conversion Elements:** Auth pages in modern web apps aren't just forms; they are landing pages. Adding feature lists and social proof (stats) directly to the login/register screens decreases bounce rates and sets a premium tone before the user even enters the app.
- **Design System Resilience:** By adding `.light-mode` overrides directly to `styles.css` instead of relying entirely on PrimeNG presets, we ensure our custom utility classes and layout backgrounds respect the theme toggle consistently.
- **Frontend-Backend Enum Alignment:** The frontend Priority enum was zero-indexed (`Low = 0`), while the backend domain enum started at 1 (`Low = 1`). This caused the backend's `IsInEnum` validator to reject frontend requests for Low priority. We aligned the frontend `todo.model.ts` to exactly match `TodoList.Domain.Enums.Priority` and exposed the missing `Critical` priority level throughout the UI to ensure 1:1 parity.
- **Date-only Validation for Due Dates**: Rather than forcing `DueDate > DateTime.UtcNow` and accidentally failing same-day task creation if the exact second is in the past, validating `.Date >= DateTime.UtcNow.Date` is much more practical for task management apps. It honors that users often plan tasks retrospectively for the current day.
- **Attention Micro-animations**: Adding an animated pulse to an icon (`pi-exclamation-circle text-danger`) instead of a generic red border draws the user's eye precisely to items requiring immediate action (due within 24 hours or marked critical), fulfilling the "wow factor" and dynamic design requirements without cluttering the card real estate.
- **Global DateTime Conversion for EF Core**: SQL Server does not store timezone information (`datetime2` drops the `DateTimeKind`). As a result, when data comes out, ASP.NET returns `"2026-07-20T08:08:00"` instead of `"2026-07-20T08:08:00Z"`. By forcing EF Core to map all `DateTime` properties to `DateTimeKind.Utc` within `ApplicationDbContext.OnModelCreating()`, we ensure standard ISO8601 formatting during JSON serialization. 
- **Robust Frontend Timezones**: Relying solely on the backend to append 'Z' is risky if the backend isn't rebooted immediately. By piping the HTTP responses through a `fixDateStrings` helper in Angular's `TodoService`, the frontend intercepts all dates and forcefully standardizes them to UTC before Angular's date pipes process them, completely bulletproofing the timezone shift.
- **Collapsible Sidebar Architecture**: Transformed static sidebar lists into interactive directory-like features. Adding `routerLink` to the section headers provides the requested URL tracking (`?section=tags`), and Angular signals manage the open/close state cleanly. It improves space utilization for power users who might have many tags.
- **Vitest Over Jasmine**: Leveraged the native Vitest integration introduced via the `@angular/build:unit-test` executor in Angular's modern builder, moving away from Karma/Jasmine to execute tests significantly faster natively in Node.
- **Service Mocking with vi.fn()**: Adapted test fixtures to use Vitest's `vi.fn()` and `vi.spyOn` instead of `jasmine.createSpyObj`, ensuring tests fully utilize Vitest's native mock capabilities and type definitions.
- **Test Timers**: Replaced Angular's `fakeAsync`/`tick` with Vitest's `vi.useFakeTimers()` to verify debounce operations cleanly without requiring `zone.js/testing`, perfectly aligning with Angular's push toward zoneless applications.

### ⚠️ Problems / Blockers
- None today.

### 📌 Tomorrow / Next Session
- [x] Phase 8 — DevOps & Project Hygiene

### 🎉 Phase 8 — DevOps & Project Hygiene Complete
- **Dockerization:** Added a `Dockerfile` for the `.NET API` and integrated it into `docker-compose.yml`, enabling the entire backend (API + SQL Server) to run with a single command.
- **Documentation:** Created a comprehensive `README.md` containing features, prerequisites, setup instructions, and an architectural overview.
- **Project Structure:** Added `Directory.Build.props` to centralize and enforce consistent build settings (`net10.0`, `ImplicitUsings`, `Nullable`) across all `.csproj` files.
- **Developer Experience:** Added automatic Entity Framework Core migration logic to `Program.cs` that safely applies pending migrations on startup when running in the `Development` environment.
- **Git Hygiene:** Verified that the `.gitignore` was correctly configured for .NET and Angular environments.

### 🎉 Frontend Redesign Complete
The entire 7-phase UI/UX redesign has been successfully implemented.

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
