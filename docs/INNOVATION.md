# TENFLOW Innovation & Creative Design Specification

> Advancing Gen Z personal finance from passive accounting to real-time consequence prediction.

---

## 1. Core Innovation Tenet: Consequence Prediction vs. Passive Tracking

Traditional personal finance tools suffer from **retrospective bias**: they report that money is gone *after* it has already been spent. For Gen Z students and entry-level workers managing a tight ₹10,000 monthly allowance, this creates guilt without actionable control.

**TENFLOW fundamentally inverts this paradigm:**
- Every spending decision is treated as a **future vector shift**.
- Before spending ₹2,000 on shopping or ₹299 on a subscription, the user enters the **What-If Decision Lab** (`/simulate`) to observe the direct consequence on their remaining 21 days:
  - *Does my daily allowance drop below ₹150/day?*
  - *Do I run out of cash before Day 30?*
  - *Does this decision breach my ₹1,000 emergency buffer?*

---

## 2. The 5 Foundational Innovations

### 1. Interactive 3D WebGL Orbital Telemetry
- Custom Three.js composition featuring a faceted luminous rupee core, floating metallic tension geometry, and 30 discrete orbital day nodes.
- Dual-mode architecture: automatically provisions a 60fps WebGL canvas on modern GPUs, and seamlessly cascades to a 2.5D CSS/SVG orbital composition if WebGL is unsupported or `prefers-reduced-motion` is active.
- Battery-conserving RAF loop that automatically suspends GPU ticks when the browser tab is hidden (`document.hidden`).

### 2. Live Dynamic Glidepath Engine
- Conventional budgets allocate fixed buckets (e.g. ₹3,000 for food, ₹1,000 for transit). When one bucket overflows, the user abandons the app.
- TENFLOW uses an **adaptive glidepath formula**:
  $$SDA = \frac{\text{Uncommitted Liquid Cash}}{\text{Days Remaining}}$$
  If a user overspends on Day 5, the model does not break—it dynamically compresses days 6–30 by a few rupees per day, guiding the user back to survival without bankruptcy.

### 3. Virtual Ring-Fencing
- Savings goals often fail for low-budget users because transferring cash to a separate bank account causes overdraft fees.
- TENFLOW implements **virtual ring-fencing**: funds earmarked for savings are subtracted from the *discretionary daily allowance* while remaining 100% liquid in pocket for genuine life emergencies.

### 4. 100-Point Explainable Health Diagnostics
- Rather than an opaque credit score or black-box AI rating, TENFLOW’s health score is **100% deterministic and transparently attributed**:
  - **Burn Rate Discipline (35 pts):** Velocity vs. sustainable pace.
  - **Commitment Coverage (25 pts):** Liquid backing for fixed recurring bills.
  - **Emergency Cushion (25 pts):** Protection of the ₹1,000 emergency floor.
  - **Savings Momentum (15 pts):** Forward-looking buffer growth.

### 5. Zero-Telemetry Privacy Vault
- Zero bank credentials collected.
- Zero analytics tracking or third-party cookies.
- 100% client-side schema verification with JSON export and recovery.
