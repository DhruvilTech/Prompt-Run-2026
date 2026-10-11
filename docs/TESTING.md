# TENFLOW Automated Testing & Quality Assurance Suite

This document outlines the testing architecture, quality gates, and automated test coverage for TENFLOW.

---

## 1. Test Architecture Overview

TENFLOW employs a multi-tiered test strategy executed via **Vitest** and **React Testing Library**:

* **Unit Tests:** Rigorous mathematical assertion of financial formulas, health scoring, deficit tracking, and input sanitization.
* **Integration Tests:** End-to-end user journeys simulating budget creation, unexpected financial shocks, day advancement, and goal funding.
* **Typecheck Gates:** Static type assertion via TypeScript `tsc --noEmit`.
* **Linting Gates:** Zero-tolerance ESLint enforcement (`--max-warnings 0`).

---

## 2. Test Execution Commands

```bash
# Run all tests once in headless CI mode
npm test

# Run tests with real-time file watcher
npm run test:watch

# Run TypeScript strict typecheck
npm run typecheck

# Run ESLint static code quality analysis
npm run lint
```

---

## 3. Test Suites & Coverage Breakdown

### Suite A: Financial Engine Tests (`src/test/financeEngine.test.ts`)
* **Test 1:** Baseline calculation on Day 1 with ₹10,000 initial budget.
* **Test 2:** Dynamic daily allowance updates upon income injection.
* **Test 3:** Unpaid future commitments reduce safe daily allowance.
* **Test 4:** Honest deficit tracking without artificial zero-clamping.
* **Test 5:** Risk index categorization (`low_risk`, `caution`, `high_risk`).
* **Test 6:** Trajectory curve generation matching linear target glidepaths.
* **Test 7:** Input sanitization stripping script tags and malicious HTML.
* **Test 8:** Bounding numeric validation rejecting negative and non-finite values.

### Suite B: User Journey Integration Tests (`src/test/userJourneys.test.tsx`)
* **Journey 1:** End-to-end transaction logging ripples into safe daily allowance.
* **Journey 2:** Unexpected ₹1,500 expense triggers financial shock alerts and recalculates runway.
* **Journey 3:** Advancing challenge timeline from Day 1 to Day 6 increments pace velocity.
* **Journey 4:** Adding fixed monthly liabilities locks in committed buffer.
* **Journey 5:** Goal progress funding transfers cash into protected surplus envelopes.
* **Journey 6:** Decision simulator what-if preview updates delta telemetry without mutating persistent state.
* **Journey 7:** State persistence and restore from localStorage.

---

## 4. Continuous Integration (CI) Workflow

Every commit to `main` executes `.github/workflows/ci.yml`:
1. Environment checkout on Ubuntu Latest with Node 20.x (`.nvmrc`).
2. Dependency installation via `npm ci`.
3. Strict Linting (`npm run lint`).
4. Strict Typecheck (`npm run typecheck`).
5. Vitest Suite Execution (`npm test`).
6. Production Build Verification (`npm run build`).
