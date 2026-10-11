# TENFLOW Responsive Design & Adaptive Layout Matrix

> Mobile-first, fluid responsive engineering accommodating screen widths from 320px compact smartphones to 4K ultra-wide workstations.

---

## 1. Breakpoint Grid Specification

TENFLOW leverages standard Tailwind CSS responsive breakpoints tailored to fluid mobile ergonomics:

| Breakpoint | Minimum Width | Typical Devices | Layout Strategy |
| :--- | :---: | :--- | :--- |
| **Default** | `< 640px` | iPhone SE, Galaxy S, Pixel (compact mobile) | Single-column flow, bottom action triggers, drawer navigation |
| **`sm`** | `≥ 640px` | iPhone Pro Max, larger phones in landscape | 2-column bento cards, enlarged touch targets |
| **`md`** | `≥ 768px` | iPad Mini, Android tablets, small laptops | Permanent desktop sidebar, dual-column telemetry grid |
| **`lg`** | `≥ 1024px` | MacBooks, desktop monitors | 12-column bento grids, sticky 3D coin scrollytelling viewport |
| **`xl`** | `≥ 1280px` | High-res displays, widescreen monitors | Centered max-w-7xl canvas with ambient radial lighting glows |

---

## 2. Navigation Paradigms: Dual-Mode Ergonomics

### 1. Mobile Portrait Experience (`< 768px`)
* **Sticky Topbar:** Compact header with brand logo, quick transaction add button, and hamburger toggle.
* **Full-Screen Blur Drawer:** Animated slide-in modal drawer displaying full navigation links with high touch-target heights (min 48px).
* **Touch Target Standards:** All interactive buttons and inputs comply with WCAG 2.2 Level AA minimum touch target sizing ($44 \times 44\text{ px}$).

### 2. Desktop Workspace (`≥ 768px`)
* **Permanent Sidebar:** Glassmorphic sidebar navigation with active indicator pill, quick status telemetry badge, and direct shortcut back to the 3D landing hero.
* **Persistent Topbar:** Displays real-time 30-day budget progress, days remaining pill, quick health meter, and primary `+ Quick Add` CTA.

---

## 3. Responsive 3D WebGL Canvas & Scrollytelling Viewport

The 3D Rupee Coin scene in `ScrollytellingHero.tsx` and `Hero3DCanvas.tsx` dynamically adapts its dimensions and camera frustum:
* **Mobile (`< 640px`):** Fixed height container at 360px with automatic touch-event passive listener handling to prevent blocking scroll gestures.
* **Tablet (`640px – 1024px`):** Rescaled 420px container centered within the viewport.
* **Desktop (`≥ 1024px`):** Sticky 580px viewport pinned alongside the 4-stage narrative cards, allowing users to scrub or scroll smoothly without disorientation.

---

## 4. Typography & Fluid Font Scaling

All typography uses proportional CSS clamp and responsive utility tiers:
* Headlines scale from `text-3xl` on mobile to `text-6xl` on desktop.
* Numerical metrics maintain `tabular-nums` formatting to prevent layout jittering during number counter increments.
* High-density tables on `/transactions` and `/plan` automatically provide horizontal swipe containers (`overflow-x-auto`) to preserve layout integrity on small screens.
