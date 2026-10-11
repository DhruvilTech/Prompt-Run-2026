# TENFLOW Production Deployment & Infrastructure Guide

This guide details deployment architecture, hosting providers, caching rules, and environment specifications for TENFLOW.

---

## 1. Hosting Architecture

TENFLOW is designed for serverless, static hosting on high-performance CDN edge networks:

* **Primary Production Host:** [Netlify](https://www.netlify.com/)
* **Secondary Mirror:** [Vercel](https://vercel.com/)
* **Build System:** Vite 5 with Rollup code-splitting

---

## 2. Production Build Configuration

### Build Command
```bash
npm run build
```

### Output Directory
```
dist/
```

### Chunking Strategy (`vite.config.ts`)
Three-tier vendor chunking eliminates monolithic script downloads:
* `three-vendor`: Isolated Three.js runtime (~477 kB raw, ~120 kB gzip).
* `react-vendor`: React 18, React DOM, and React Router (~206 kB raw, ~67 kB gzip).
* `ui-vendor`: Lucide icons, Framer Motion, and utility primitives (~39 kB raw, ~10 kB gzip).
* `index.js`: Application logic and route skeletons (~156 kB raw, ~36 kB gzip).

---

## 3. Netlify Configuration (`netlify.toml`)

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## 4. Vercel Configuration (`vercel.json`)

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 5. Deployment Verification Checklist

- [x] HTTPS enabled with active SSL/TLS certificates.
- [x] Zero-404 client-side SPA routing verified for direct deep links (`/dashboard`, `/simulate`, `/plan`).
- [x] Security headers active (`nosniff`, `DENY`, `strict-origin-when-cross-origin`).
- [x] Gzip/Brotli compression verified on CDN edge.
- [x] Cache-Control headers serving immutable assets for 1 year (`max-age=31536000`).
