# Changelog

All notable changes to TENFLOW are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-10-11

### Added
- **Production SPA Routing:** Added `netlify.toml` and `vercel.json` with fallback rewrites (`/* -> /index.html 200`) and immutable asset caching.
- **Error Boundary:** Added `<ErrorBoundary>` component with recovery HUD.
- **Architectural Specs:** Comprehensive `docs/ARCHITECTURE.md`, `docs/DECISION_SIMULATOR.md`, `docs/ACCESSIBILITY.md`, `CONTRIBUTING.md`, and `CODE_OF_CONDUCT.md`.
- **Keyboard Skip Navigation:** High-contrast `<a href="#main-content">` skip link and landmark structure.
- **Current Pace Curve:** SVG 30-day timeline chart now renders amber dashed burn rate trajectory matching legend.

### Changed
- **Performance Optimization:** Rollup manual chunks separating `three-vendor` (491 kB), `react-vendor` (206 kB), and `ui-vendor` (39 kB). Initial application bundle compressed to ~35 kB gzip.
- **Accounting Deficit Accuracy:** Removed artificial zero-clamping in `src/domain/financeEngine.ts` to honestly track and visualize negative cashflow shortfalls.
- **Unit & Journey Tests:** Expanded Vitest test harness to 15 passing tests validating deficit invariants.

## [1.0.0] - 2026-10-11

### Added
- Initial project release for Frontend Arena 2026 challenge: "Broke But Functional — Survive the Month".
- 3D WebGL Coin Hero, Scrollytelling Orbit, Decision Simulator, Planning Horizon, and Local Storage vault.
