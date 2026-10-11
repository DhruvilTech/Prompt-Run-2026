# TENFLOW Decision Simulator & Consequence Prediction Specification

## 1. Overview & Innovation Rationale

Most budgeting applications suffer from **retrospective paralysis**: they tell users what they spent *after* the cash is already gone. 

TENFLOW flips this dynamic with the **What-If Decision Simulator** (`/simulate`), a non-destructive consequence prediction laboratory that lets Gen Z users answer:
> *“If I buy these ₹2,000 headphones today, or sign up for a ₹299 subscription, what exactly happens to my safe daily spending allowance for the remaining 21 days?”*

---

## 2. Mathematical Simulation Pipeline

When a user selects or creates a hypothetical scenario:
1. **Immutable Snapshotting:** Current application state (`config`, `transactions`, `commitments`, `goals`) is cloned via pure functional duplication. No React context or persistent `localStorage` data is mutated.
2. **Scenario Transformation:**
   - `one_off_expense` & `unexpected_expense`: Appends a synthetic transaction at `currentDay`.
   - `new_subscription`: Inserts an unpaid commitment due on `currentDay + 5` (or nearest billing cycle).
   - `cancel_subscription`: Drops targeted recurring commitments, releasing earmarked reserves.
   - `savings_allocation` & `reserve_buffer`: Earmarks cash into virtual savings buffers, reducing discretionary daily allowance while preserving liquid pocket cash.
3. **Simultaneous Summary Generation:** `calculateFinanceSummary()` is executed across both baseline and simulated states.
4. **Delta Derivation Matrix:**
   - $\Delta \text{Remaining Cash} = R_{\text{sim}} - R_{\text{base}}$
   - $\Delta \text{Uncommitted Balance} = U_{\text{sim}} - U_{\text{base}}$
   - $\Delta \text{Safe Daily Allowance} = SDA_{\text{sim}} - SDA_{\text{base}}$
   - $\Delta \text{Projected Month-End Balance} = P_{\text{sim}} - P_{\text{base}}$
   - $\Delta \text{Health Score} = H_{\text{sim}} - H_{\text{base}}$

---

## 3. Algorithmic Recommendation Engine

The simulator generates plain-language, non-judgmental guidance:
- **Critical Risk:** Triggered if $U_{\text{sim}} \le 0$ (Default on fixed commitments).
- **Allowance Compression Warning:** Triggered if $SDA_{\text{sim}} < ₹100/\text{day}$.
- **Prudent Trade-off:** Suggests 3-day non-essential spending freeze to absorb discretionary spikes.
- **Positive Resiliency:** Validates income gigs and subscription cancellations.

---

## 4. State Commit Safety Guards

Users can test scenarios freely without consequence. When opting to make a decision permanent:
- `applyDecisionToState()` executes defensive validation via `validateAmount()`.
- Generates cryptographically unique transaction/commitment IDs (`tx-<timestamp>-<hash>`).
- Atomically dispatches to `FinanceContext` and syncs with `tenflow_state_v1` in `localStorage`.
