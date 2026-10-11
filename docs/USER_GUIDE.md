# TENFLOW User & Evaluation Guide

> Complete walkthrough of TENFLOW for judges, evaluators, and Gen Z budgeters managing ₹10,000 over 30 days.

---

## 1. Quick Start & Evaluation Overview

TENFLOW can be evaluated immediately online or tested locally:

* **Live Deployment:** [https://regal-profiterole-aa532d.netlify.app/](https://regal-profiterole-aa532d.netlify.app/)
* **Local Run:** `npm install && npm run dev`
* **Automated Tests:** `npm test` (47/47 passing tests)

---

## 2. Navigating the 7 Core Application Views

### View 1: 3D Scrollytelling Hero (`/`)
* **3D Luminous Rupee:** Interactive WebGL coin centered with metallic orbit rings and floating tension geometry.
* **4-Stage Financial Journey:**
  1. *Stage 01: The Launch (Day 1)* — Full ₹10,000 tank and optimism.
  2. *Stage 02: Daily Flow (Days 2–10)* — Micro-costs, cold brews, and gradual attrition.
  3. *Stage 03: The Shock (Day 16)* — Unexpected ₹1,500 emergency bike repair with red warning tension lighting.
  4. *Stage 04: Regain Control (Days 17–30)* — Re-calibrated glidepath to reach Day 30 solvent.
* **Interactive Timeline Scrubber:** Drag the range slider between Day 1 and Day 30 to see the 3D coin rotate and react dynamically.

---

### View 2: Financial Command Center (`/dashboard`)
* **The 5 Big Questions Answered Instantly:**
  1. *How much real cash is in my pocket?* (Remaining Cash)
  2. *How much can I spend today without going broke?* (Safe Daily Allowance)
  3. *Am I spending faster than I should?* (Burn Multiplier & Daily Burn Rate)
  4. *What upcoming bills are already locked in?* (Unpaid Fixed Commitments)
  5. *What is my overall survival health score?* (100-Point Explainable Health Rating)
* **Upcoming Bills Quick-Action:** Click "Mark Paid" on any upcoming bill to instantly record it into the ledger without duplicate deductions.
* **Recent Activity Feed:** Real-time log of recent transactions with category icons.

---

### View 3: What-If Decision Lab (`/simulate`)
* **Hypothetical Scenario Testing:**
  - Test real Gen Z decisions: *“Should I buy ₹2,000 headphones?”*, *“Order late-night food for ₹450?”*, or *“Cancel my gym membership to save ₹600?”*
* **Side-by-Side Delta Comparison:**
  - Compares Baseline vs. Simulated future across Remaining Cash, Safe Daily Allowance, Buffer Health, and Month-End Projection.
* **Non-Destructive Simulation:** Simulations are ephemeral and never mutate the actual ledger until the user explicitly clicks **“Commit Decision to Month”**.

---

### View 4: 30-Day Budget Plan (`/plan`)
* **Challenge Timeline Configuration:**
  - Adjust starting budget (standard ₹10,000) and target emergency buffer (standard ₹1,000).
  - Advance the day counter by clicking **“Advance Day (+1)”**.
* **Fixed Monthly Liabilities:**
  - Manage rent, subscriptions, phone bills, and WiFi.
  - Due-day markers indicate when obligations mature.

---

### View 5: Transaction Ledger (`/transactions`)
* **Complete CRUD Registry:**
  - Add, filter, search, and delete expenses and income.
* **Category Filtering:** Filter across Food & Dining, Travel, Bills, Shopping, Entertainment, and Freelance Income.
* **Keyword Search:** Instant search by description or merchant name.

---

### View 6: Virtual Savings Goals (`/goals`)
* **Virtual Ring-Fencing:**
  - Allocate money toward goals (e.g., Emergency Fund, Tech Upgrade) without locking cash in inaccessible external accounts.
  - Funds are subtracted from the *safe daily spending allowance* to prevent impulse buying, while remaining 100% liquid for emergencies.

---

### View 7: Explainable Health & Outlook (`/insights`)
* **100-Point Score Breakdown:**
  - Transparent factor attribution: Burn Rate Discipline (35 pts), Commitment Coverage (25 pts), Buffer Resilience (25 pts), Savings Momentum (15 pts).
* **Survival Trajectory Projection:** Day-by-day forecast indicating projected balance on Day 30.

---

### View 8: Settings & Privacy Vault (`/settings`)
* **Client-Side Data Sovereignty:**
  - **Export Data:** Download entire financial state as a JSON backup file.
  - **Import Data:** Restore from a previously saved JSON state.
  - **Reset to Baseline:** Instantly resets to the ₹10,000 student demo state.
