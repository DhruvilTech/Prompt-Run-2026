# TENFLOW System Architecture & Technical Specifications

> High-performance Gen Z financial survival command center managing ₹10,000 across 30 days.

---

## 1. Architectural Philosophy

TENFLOW is engineered around three foundational architectural constraints:
1. **Zero-Backend Sovereignty:** Zero cloud telemetry, zero remote database calls, zero bank scrapers. 100% of calculation, ledger indexing, and predictive forecasting occurs deterministically on-device inside Web Workers / JavaScript engine.
2. **Decoupled Mathematical Domain:** Pure calculation logic (`src/domain/`) is completely free of React hooks, DOM manipulation, or UI state. All financial invariants are verified via isolated Vitest test runners.
3. **Immutability & Non-Destructive Simulation:** Hypothetical "What-If" decisions clone application state primitives immutably, ensuring sandbox operations never contaminate the active ledger.

---

## 2. Directory Hierarchy & Separation of Concerns

```
src/
├── app/                  # Application composition root
│   ├── App.tsx           # Context providers and root shell
│   └── router.tsx        # Declarative SPA routing (7 routes)
│
├── domain/               # PURE MATHEMATICAL CORE (0 UI Dependencies)
│   ├── financeTypes.ts   # Discriminated unions, branded types, state schemas
│   ├── financeEngine.ts  # Deterministic summary calculations & simulation engine
│   ├── financeFormatters.ts # Indian Rupee (INR) notation & delta formatting
│   └── financeValidation.ts # Runtime sanitization, XSS stripping, schema recovery
│
├── state/                # CLIENT-SIDE STATE VAULT
│   ├── FinanceContext.tsx# Central React context & state dispatchers
│   ├── storage.ts        # Validated LocalStorage adapter (tenflow_state_v1)
│   └── sampleData.ts     # Baseline ₹10,000 student demo state
│
├── features/             # MODULAR FEATURE DOMAINS
│   ├── landing/          # 3D WebGL Hero, Scrollytelling Orbit, Reality Timeline
│   ├── dashboard/        # 5-card telemetry HUD answering core questions
│   ├── simulator/        # Decision Lab with side-by-side comparative matrices
│   ├── plan/             # 30-day timeline configuration & subscription deduplication
│   ├── transactions/     # CRUD registry with search, category filtering & sorting
│   ├── goals/            # Virtual ring-fencing savings allocation
│   ├── insights/         # Algorithmic 100-point explainable health diagnostics
│   └── settings/         # JSON import/export, reset, local storage health
│
├── components/           # ATOMIC DESIGN SYSTEM (Midnight Mint)
│   ├── ui/               # Badge, Button, Card, Input, Modal, Select, NumberCounter
│   ├── layout/           # AppShell, Desktop Topbar, Mobile Drawer
│   └── finance/          # QuickAdd modal dialogs
│
└── test/                 # AUTOMATED TEST HARNESS
    ├── setup.ts          # Vitest JSDOM environment initialization
    ├── financeEngine.test.ts # Mathematical unit test suite (8 tests)
    └── userJourneys.test.tsx # End-to-end integration journeys (7 tests)
```

---

## 3. Mathematical Domain Model

### 3.1 Primary Financial Invariants

1. **Remaining Liquid Cash ($R$):**
   $$R = B_0 + \sum_{i \in \text{Income}} I_i - \sum_{j \in \text{Expenses}} E_j$$
   Where $B_0 = ₹10,000$ (default initial cap).

2. **Uncommitted Buffer ($U$):**
   $$U = R - \sum_{k \in \text{Unpaid Commitments}} C_k - \sum_{g \in \text{Goals}} S_g$$
   *Note: TENFLOW never clamps $U$ to zero if expenditures exceed capital; negative deficits are explicitly reported to alert the user of impending insolvency.*

3. **Safe Daily Allowance ($SDA$):**
   $$SDA = \begin{cases} \frac{U}{\max(1, D_{\text{remaining}})} & \text{if } U > 0 \\ 0 & \text{if } U \le 0 \end{cases}$$

4. **Actual Burn Rate ($ABR$) & Burn Multiplier ($BM$):**
   $$ABR = \frac{\sum_{j} E_j}{\max(1, D_{\text{elapsed}})}, \quad BM = \begin{cases} \frac{ABR}{SDA} & \text{if } SDA > 0 \\ 999 & \text{if } SDA = 0 \land ABR > 0 \\ 1 & \text{otherwise} \end{cases}$$

---

## 4. Performance & Bundle Optimization Strategy

- **Granular Manual Chunking:** `three` (491 kB), `react-vendor` (206 kB), and `ui-vendor` (39 kB) are isolated into dedicated vendor chunks in Rollup configuration.
- **Initial App JS Footprint:** The entry bundle is compressed down to **~35 kB gzip**, satisfying Google Lighthouse mobile performance guidelines.
- **Asset Caching:** Assets are declared with `Cache-Control: public, max-age=31536000, immutable`.
- **GPU Resource Hygiene:** Three.js geometries, textures, and animation frames are explicitly unbound and disposed of during component cleanup cycles.
