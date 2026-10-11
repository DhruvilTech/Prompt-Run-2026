# Security Policy — TENFLOW Financial Command Center

## Supported Versions

TENFLOW adheres to strict client-side security standards. All updates and patches are continuously applied to the active `main` branch.

| Version | Supported          | Security State |
| ------- | ------------------ | -------------- |
| 1.3.x   | :white_check_mark: | Active         |
| 1.2.x   | :white_check_mark: | Maintained     |
| < 1.1   | :x:                | Deprecated     |

---

## Client-Side Security Architecture

TENFLOW is intentionally designed as an offline-first, client-side personal financial application. It processes sensitive financial data entirely within the user's browser sandbox:

1. **Zero External Data Exfiltration:**
   - No external analytics trackers, third-party pixel beacons, or unvetted scripts.
   - User transactions, account limits, and budget parameters are stored strictly in `localStorage` under isolated keys (`tenflow_state_v1`).

2. **Input Sanitization & Injection Defense:**
   - All string inputs (transaction descriptions, notes, goal titles) pass through `sanitizeString()` (`src/domain/financeValidation.ts`), stripping HTML tags, script constructs, control characters, and dangerous Unicode payloads.
   - Numeric inputs pass through strict bounding validators (`validateAmount()`) enforcing `0 <= x <= 10,000,000` to prevent integer overflows or non-finite inputs (`NaN`, `Infinity`).

3. **Content Security Policy & HTTP Headers:**
   - Configured in `netlify.toml` and `public/_headers`:
     - `X-Frame-Options: DENY` (prevents clickjacking attacks)
     - `X-Content-Type-Options: nosniff` (prevents MIME-type confusion attacks)
     - `Referrer-Policy: strict-origin-when-cross-origin` (prevents leakage of referrer paths)
     - `Permissions-Policy: camera=(), microphone=(), geolocation=()` (restricts privileged hardware APIs)

4. **Dependency Auditing:**
   - Dependencies are audited against known CVEs via automated security scanners (`npm audit`).
   - Zero production dependencies with known high/critical vulnerabilities.

---

## Reporting a Vulnerability

If you discover a security vulnerability in TENFLOW, please report it responsibly:

1. **Do not create public GitHub issues** for undisclosed security vulnerabilities.
2. Email the maintainer directly at: `security@tenflow.app` (or submit a private vulnerability advisory via GitHub).
3. Include:
   - Description of the vulnerability.
   - Steps to reproduce or proof-of-concept payload.
   - Potential impact assessment.
4. You will receive an initial response within 24 hours acknowledging receipt.
5. A remediation patch will be tested and deployed within 48–72 hours of confirmation.
