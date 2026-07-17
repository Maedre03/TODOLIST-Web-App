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

## General Project Rules
- This is a professional-grade .NET Clean Architecture + Angular project. Follow industry best practices.
- Backend: ASP.NET Core Web API with Clean Architecture (Domain → Application → Infrastructure → API).
- Frontend: Angular with PrimeNG.
- Database: PostgreSQL via Docker Compose.
- Always explain architectural decisions in comments or journal — this is a learning project.
