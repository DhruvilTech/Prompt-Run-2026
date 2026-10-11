# Contributing to TENFLOW

Thank you for your interest in contributing to TENFLOW — the Gen Z financial survival command center for Frontend Arena 2026.

---

## Development Standards

### 1. Code Quality & Formatting
- **TypeScript:** Strict mode enabled. No `any`, no implicit casts, no unused variables.
- **Linter:** ESLint with `--max-warnings 0`. Run `npm run lint` before committing.
- **Code Formatting:** Configured via `.prettierrc` (2 spaces, semi-colons, single quotes). Run `npm run typecheck` to verify compiler integrity.

### 2. Testing Guidelines
- All domain financial formulas must reside in `src/domain/financeEngine.ts` as pure deterministic functions.
- Every formula modification requires corresponding unit tests in `src/test/financeEngine.test.ts`.
- Run the full test suite with `npm test`.

### 3. Git Workflow
- Keep commits descriptive (e.g. `feat: ...`, `fix: ...`, `docs: ...`, `perf: ...`).
- Ensure CI workflow (`.github/workflows/ci.yml`) passes cleanly on every branch.
