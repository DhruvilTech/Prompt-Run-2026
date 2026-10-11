# TENFLOW API & Domain Architecture Reference

This document provides the complete, authoritative API reference for TENFLOW's deterministic financial calculation engine, state hooks, formatting utilities, and data validation layers.

---

## 1. Core Financial Calculation Engine (`src/domain/financeEngine.ts`)

All financial calculation logic consists of pure, deterministic functions without side effects or UI dependencies.

### `calculateFinanceSummary(config, transactions, commitments, goals): FinanceSummary`

Calculates comprehensive real-time financial telemetry from raw application state primitives.

#### Parameters
* `config: PlanningConfig` — Challenge configuration including `startingBudget` (₹10,000), `totalDays` (30), `currentDay` (1 to 30), `startDate`, and `emergencyBufferGoal` (₹1,000).
* `transactions: Transaction[]` — Historical and posted ledger items.
* `commitments: Commitment[]` — Fixed recurring obligations.
* `goals: SavingsGoal[]` — Prioritized virtual savings goals.

#### Mathematical Formulations
1. **Actual Posted Income ($I$):**
   $$I = \sum_{t \in \text{actual transactions}, t.\text{type} = \text{'income'}} t.\text{amount}$$

2. **Actual Posted Expenses ($E$):**
   $$E = \sum_{t \in \text{actual transactions}, t.\text{type} = \text{'expense'}} t.\text{amount}$$

3. **Current Remaining Liquid Cash ($R$):**
   $$R = B_0 + I - E \quad (\text{where } B_0 = \text{config.startingBudget})$$

4. **Unpaid Future Commitments ($C_{\text{unpaid}}$):**
   $$C_{\text{unpaid}} = \sum_{c \in \text{commitments}, c.\text{isPaid} = \text{false}} c.\text{amount}$$

5. **Ring-Fenced Savings Allocations ($S_{\text{goals}}$):**
   $$S_{\text{goals}} = \sum_{g \in \text{goals}} g.\text{currentAmount}$$

6. **Uncommitted Buffer ($U$):**
   $$U = R - C_{\text{unpaid}} - S_{\text{goals}}$$
   *(Preserves negative values honestly to surface true budget deficits).*

7. **Days Remaining ($D_{\text{rem}}$):**
   $$D_{\text{rem}} = \max(1, \text{config.totalDays} - \text{config.currentDay} + 1)$$

8. **Safe Daily Allowance ($SDA$):**
   $$SDA = \begin{cases} \frac{U}{D_{\text{rem}}} & \text{if } U > 0 \\ 0 & \text{if } U \le 0 \end{cases}$$

9. **Actual Burn Rate ($ABR$) & Burn Multiplier ($BM$):**
   $$ABR = \frac{E}{\max(1, \text{config.currentDay})}, \quad BM = \begin{cases} \frac{ABR}{SDA} & \text{if } SDA > 0 \\ 999 & \text{if } SDA = 0 \land ABR > 0 \\ 1 & \text{otherwise} \end{cases}$$

10. **Explainable 100-Point Health Score ($H$):**
    Composed of 4 weighted factors:
    * **Burn Rate Discipline (35 pts):** Evaluates actual consumption against sustainable allowance.
    * **Commitment Coverage (25 pts):** Verifies liquid backing for all upcoming fixed bills.
    * **Buffer Resilience (25 pts):** Preserves the ₹1,000 emergency liquid safety floor.
    * **Savings Momentum (15 pts):** Rewards progress on funded savings goals.

#### Returns
`FinanceSummary` telemetry snapshot containing `remainingCash`, `uncommittedBalance`, `safeDailyAllowance`, `dailyBurnRate`, `burnMultiplier`, `financialHealthScore`, `financialRisk`, `healthFactors`, and trajectory vectors.

---

### `roundCurrency(val: number): number`

Rounds numerical amounts to 2 decimal places using IEEE-754 epsilon adjustment to eliminate precision artifacts:
```typescript
Math.round((val + Number.EPSILON) * 100) / 100
```

---

### `simulateDecision(baselineConfig, baselineTransactions, baselineCommitments, baselineGoals, scenario): ScenarioComparison`

Executes a non-destructive "What-If" decision simulation by creating immutable state forks:

* Clones baseline state collections.
* Injects simulated scenario impacts (`one_off_expense`, `recurring_commitment`, `income`, `savings_transfer`).
* Computes twin telemetry models for baseline and simulated futures.
* Calculates side-by-side deltas ($\Delta \text{Cash}$, $\Delta \text{Allowance}$, $\Delta \text{Buffer}$, $\Delta \text{Health Score}$).
* Evaluates non-judgmental plain-language consequence diagnostics.

---

### `applyDecisionToState(state, scenario)`

Applies a tested hypothetical scenario permanently to actual ledger state with cryptographic ID generation (`tx-<timestamp>-<hash>`) and defensive bounds checking.

---

## 2. Input Validation & Schema Sanitization (`src/domain/financeValidation.ts`)

* `sanitizeString(input: unknown, maxLength?: number): string` — Strips `<script>`, `<style>`, `<iframe>` blocks and contents, filters control characters, and enforces length bounds.
* `validateAmount(val: unknown, min?: number, max?: number): { isValid: boolean; value: number; error?: string }` — Validates finite positive currency numbers with 2-decimal rounding.
* `validateDayIndex(val: unknown, maxDay?: number): number` — Clamps cycle day index to standard $[1, 30]$.
* `validateAppStateSchema(payload: unknown): { isValid: boolean; parsed?: AppState; error?: string }` — Deep runtime schema assertion with whitelist sanitization against corrupted browser payloads.

---

## 3. Formatting & Currency Utilities (`src/domain/financeFormatters.ts`)

* `formatRupees(amount: number, includeDecimals?: boolean): string` — Formats amounts in Indian Rupee notation (`₹10,000`, `₹404.76`).
* `formatRupeesDelta(amount: number, includeDecimals?: boolean): string` — Formats signed cashflow deltas (`+₹1,500`, `-₹350`).
* `formatPercent(value: number, decimals?: number): string` — Formats percentage ratios (`74.5%`).
* `formatDateLabel(dayIndex: number): string` — Formats 30-day challenge labels (`Day 12 of 30`).

---

## 4. Local Storage Adapter & Vault (`src/state/storage.ts`)

* `loadPersistedState(): AppState` — Reads versioned payload from `localStorage`, validates schema, and falls back to baseline initial state on corruption.
* `savePersistedState(state: AppState): boolean` — Encapsulates state with timestamp and schema version `1.0` to `tenflow_state_v1`.
* `clearPersistedState(): void` — Purges persisted browser ledger cache.
* `exportStateAsJSON(state: AppState): void` — Triggers client-side browser JSON download for zero-cloud data sovereignty.

---

## 5. React State Controller (`src/state/FinanceContext.tsx`)

### `useFinance()`

Provides reactive state access and action dispatchers across all connected views:

```typescript
const {
  state,                    // AppState: config, transactions, commitments, goals
  summary,                  // FinanceSummary: live computed telemetry
  addTransaction,           // (tx: Omit<Transaction, 'id'>) => void
  deleteTransaction,        // (id: string) => void
  addCommitment,            // (c: Omit<Commitment, 'id'>) => void
  toggleCommitmentPaid,     // (id: string) => void
  deleteCommitment,         // (id: string) => void
  addGoal,                  // (g: Omit<SavingsGoal, 'id'>) => void
  updateGoalContribution,   // (id: string, amount: number) => void
  deleteGoal,               // (id: string) => void
  updateConfig,             // (updates: Partial<PlanningConfig>) => void
  advanceDay,               // () => void
  setActiveScenario,        // (scenario: DecisionScenario | null) => void
  applyScenario,            // (scenario: DecisionScenario) => void
  resetToSampleData,        // () => void
  importState,              // (data: AppState) => boolean
} = useFinance();
```
