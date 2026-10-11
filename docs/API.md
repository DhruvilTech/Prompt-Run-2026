# TENFLOW API & Domain Architecture Reference

This document provides the complete API reference for TENFLOW's deterministic financial calculation engine, state hooks, and data validation layers.

---

## 1. Financial Calculation Engine (`src/domain/financeEngine.ts`)

### `computeFinancialSummary(state: AppState): FinancialSummary`

Computes the core real-time telemetry from the current state:

#### Input
* `state`: Complete application state containing `config`, `transactions`, `commitments`, and `goals`.

#### Mathematical Formulation
1. **Total Income:**
   $$\text{Total Income} = \sum_{\text{type} = \text{'income'}} \text{amount}$$
2. **Total Expenses:**
   $$\text{Total Expenses} = \sum_{\text{type} = \text{'expense'}} \text{amount}$$
3. **Current Liquid Balance:**
   $$\text{Liquid Balance} = \text{Starting Budget} + \text{Total Income} - \text{Total Expenses}$$
4. **Total Mandatory Commitments:**
   $$\text{Total Commitments} = \sum_{\text{c} \in \text{commitments}} \text{c.amount}$$
5. **Committed Unpaid:**
   $$\text{Committed Unpaid} = \sum_{c.dayIndex > config.currentDay} c.amount$$
6. **Uncommitted Balance (Deficit Tracking):**
   $$\text{Uncommitted Balance} = \text{Liquid Balance} - \text{Committed Unpaid} - \text{Target Savings}$$
   *(Note: Preserves negative values honestly to surface true budget deficits).*
7. **Safe Daily Allowance:**
   $$\text{Allowance} = \frac{\text{Uncommitted Balance}}{\max(1, \text{Days Remaining})}$$

#### Returns
* `FinancialSummary` interface with current balance, burn rate, days remaining, risk category, and safe daily allowance.

---

## 2. Health & Behavioral Scoring (`src/domain/financeHealth.ts`)

### `calculateHealthScore(state: AppState): { score: number; factors: HealthFactorBreakdown }`

Computes a holistic 0–100 financial health index based on 6 behavioral weights:

1. **Budget Adherence (25% weight):** Ratio of actual burn rate to ideal linear trajectory.
2. **Buffer Resilience (20% weight):** Presence of untouchable ₹1,000 liquid safety floor.
3. **Commitment Coverage (20% weight):** Ability of current liquid cash to cover pending fixed obligations.
4. **Savings Rate (15% weight):** Progress toward funded priority goals.
5. **Pace Stability (10% weight):** Variance between standard daily allowance and 7-day trailing spend.
6. **Runway Velocity (10% weight):** Projected survival days at current consumption rate.

---

## 3. Projection & Trajectory Engine (`src/domain/financeProjections.ts`)

### `generateProjectionTimeline(state: AppState): ProjectionDay[]`

Generates day-by-day telemetry across the entire 30-day budget horizon:

* `day`: Day index (1 to 30).
* `actualBalance`: Historical balance up to `currentDay`.
* `projectedBalance`: Forward trajectory at current burn rate.
* `safeGlidepath`: Target linear decay curve toward planned surplus.
* `scheduledCommitments`: Fixed bill outflow dates.

---

## 4. Input Validation & Sanitization (`src/domain/financeValidation.ts`)

* `sanitizeString(input: unknown, maxLength?: number): string`: Strips script tags, HTML entities, and control characters.
* `validateAmount(val: unknown, min?: number, max?: number): ValidationResult`: Validates bounded numeric currency values.
* `validateDayIndex(val: unknown, maxDay?: number): number`: Clamps cycle day to standard `[1, 30]`.
* `validateCommitment(c: unknown): Commitment`: Deep schema assertion for recurring obligations.

---

## 5. State Management Hook (`src/state/FinanceContext.tsx`)

### `useFinance()`

Provides reactive context across all connected React views:

```typescript
const {
  state,              // Current AppState snapshot
  summary,            // Computed FinancialSummary
  addTransaction,     // Action: Record new cashflow
  deleteTransaction,  // Action: Remove cashflow
  addCommitment,      // Action: Add recurring obligation
  updateCommitment,   // Action: Toggle paid status
  advanceDay,         // Action: Advance challenge cycle
  simulateImpact,     // Action: Ephemeral decision testing
  resetToSampleData,  // Action: Reset to ₹10,000 baseline
} = useFinance();
```
