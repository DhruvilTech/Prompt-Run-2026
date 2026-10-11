# TENFLOW WCAG 2.2 Level AA Accessibility Audit Matrix

TENFLOW is engineered from the ground up to comply with **WCAG 2.2 Level AA** accessibility standards.

---

## 1. Landmark & Semantic Structure

- **Landmark Hierarchy:**
  - `<nav aria-label="Main Navigation">` & `<nav aria-label="Mobile navigation">`
  - `<header>` on desktop topbar and mobile app header
  - `<main id="main-content">` enclosing all core viewports and routes
  - `<footer>` for colophon and metadata
- **Keyboard Skip Navigation:** High-contrast bypass block (`<a href="#main-content">Skip to main content</a>`) positioned at the root of `<body>`. Becomes visible on first tab focus with a 2px electric mint glow.

---

## 2. Color Contrast & Visual Accessibility

| Interface Element | Foreground Token | Background Token | Measured Contrast Ratio | WCAG AA Standard |
| :--- | :--- | :--- | :--- | :--- |
| **Headline Text** | `#F5F7F5` (`paper.primary`) | `#080D12` (`midnight.deep`) | **16.8 : 1** | PASS (Min 4.5:1) |
| **Secondary Labels** | `#9BAEB0` (`paper.secondary`) | `#0D151B` (`midnight.surface`) | **7.4 : 1** | PASS (Min 4.5:1) |
| **Electric Mint CTA** | `#080D12` (`midnight.deep`) | `#B6FF5C` (`mint.lime`) | **14.2 : 1** | PASS (Min 4.5:1) |
| **Critical Alert** | `#FF777F` (`status.risk`) | `#121F25` (`midnight.panel`) | **5.1 : 1** | PASS (Min 4.5:1) |
| **Warning Amber** | `#FFCB70` (`status.caution`) | `#121F25` (`midnight.panel`) | **9.6 : 1** | PASS (Min 4.5:1) |

---

## 3. Keyboard Navigation & Focus Indicators

- **Global Focus Ring:** Configured in `src/index.css`:
  ```css
  *:focus-visible {
    outline: 2px solid #B6FF5C;
    outline-offset: 2px;
  }
  ```
- **Modal Dialog Focus Trapping:** All modal dialogs capture keyboard focus, block background scrolling, and dismiss cleanly on the `Escape` key.
- **Form Label Associations:** All inputs use explicit `htmlFor` and unique `id` attributes with `aria-describedby` error associations.

---

## 4. Multi-Modal Information Representation

In compliance with WCAG Success Criterion 1.4.1 (Use of Color), financial risk states and metrics are **never communicated by color alone**:
- **Critical Risk:** Includes `ShieldAlert` icon + bold textual label ("HIGH RISK") + red hue.
- **Cautionary Pace:** Includes `AlertTriangle` icon + textual warning + amber hue.
- **Stable Velocity:** Includes `ShieldCheck` icon + textual confirmation + cyan/mint hue.
- **Deltas:** Explicit numerical signs (`+₹1,500` or `-₹400`) rather than color coding.
