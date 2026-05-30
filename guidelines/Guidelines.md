# Khapeer (خبير) — Visual Identity & Design System Guidelines

> **Tone**: Calm · Premium · Stable · Trustworthy · Arabic-First  
> **Tagline**: منصة المعرفة العربية الراقية

---

## 1. Brand Identity

### Name & Positioning
- **Product name**: خبير (Khapeer) — Arabic for "Expert"
- **Category**: Arabic Q&A knowledge-sharing platform
- **Voice**: Authoritative yet warm, scholarly yet accessible
- **Audience**: Arabic-speaking professionals, students, and knowledge enthusiasts

### Brand Personality
| Attribute | Expression |
|-----------|-----------|
| Calm | Never flashy — purposeful white space, no visual noise |
| Premium | Curated palette, glassmorphism, elevated shadows |
| Stable | Consistent grid, predictable interactions |
| Arab-first | RTL by default, Arabic typography leading |

---

## 2. Color System

### Primary — Emerald of Wisdom (الزمرد المعرفي)
| Token | Value | Usage |
|-------|-------|-------|
| `--primary-500` | `hsl(170, 95%, 34%)` | CTA buttons, links, active states |
| `--primary-600` | `hsl(170, 92%, 28%)` | Hover state |
| `--primary-50`  | `hsl(170, 90%, 96%)` | Subtle tinted backgrounds |

### Secondary — Desert Gold (ذهب الصحراء)
| Token | Value | Usage |
|-------|-------|-------|
| `--secondary-500` | `hsl(43, 96%, 45%)` | Featured items, badges, leaderboard |
| `--secondary-600` | `hsl(43, 94%, 38%)` | Hover state |
| `--secondary-50`  | `hsl(43, 100%, 97%)` | Subtle gold backgrounds |

### Semantic
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| Success | `hsl(150, 78%, 36%)` | `hsl(150, 82%, 42%)` | Confirmed answers, verified |
| Warning | `hsl(32, 92%, 44%)` | `hsl(32, 94%, 52%)` | Draft, pending |
| Error/Destructive | `hsl(356, 82%, 50%)` | `hsl(356, 88%, 58%)` | Downvotes, delete |
| Info | `hsl(196, 88%, 40%)` | `hsl(196, 90%, 50%)` | System hints |

### Rules
- **Never** use pure black (#000) or pure white (#fff) for body text — use the token scale
- Background: always warm cream `hsl(44, 28%, 97%)` in light, obsidian `hsl(180, 22%, 7%)` in dark
- Minimum contrast ratio: **4.5:1** for body text (WCAG AA)
- Use `var(--primary)` and `var(--secondary)` exclusively — never hardcode hex values

---

## 3. Typography

### Font Stack
| Role | Font | Weights |
|------|------|---------|
| Headings | Tajawal → Cairo → system | 700, 800 |
| Body | Cairo → Tajawal → system | 400, 500, 600 |
| Numbers / Stats | Outfit → Cairo | 500, 600, 700 |
| Code | IBM Plex Mono | 400 |

### Type Scale
| Token | Size | Usage |
|-------|------|-------|
| `--text-xs` | 0.75rem | Labels, captions, timestamps |
| `--text-sm` | 0.875rem | Body secondary, button labels |
| `--text-base` | 1rem | Body primary |
| `--text-lg` | 1.125rem | Sub-headings, card titles |
| `--text-xl` | 1.25rem | Section headings |
| `--text-2xl` | 1.5rem | Page headings |
| `--text-3xl` | 1.875rem | Hero headings |
| `--text-4xl+` | 2.25rem+ | Display / hero only |

### Rules
- Line height: **1.85** for body, **1.35–1.5** for headings
- Letter spacing: `-0.01em` for h1–h2, `0` for body
- Numbers (vote counts, rep scores): always use `.numeral` class → applies `font-family: Outfit`
- RTL: `direction: rtl; text-align: right` on `body` — never override per-component unless LTR content (code, emails)

---

## 4. Spacing System

4px base grid (multiples of 4):

| Token | Value | px |
|-------|-------|-----|
| `--space-1` | 0.25rem | 4px |
| `--space-2` | 0.5rem | 8px |
| `--space-3` | 0.75rem | 12px |
| `--space-4` | 1rem | 16px |
| `--space-6` | 1.5rem | 24px |
| `--space-8` | 2rem | 32px |
| `--space-12` | 3rem | 48px |
| `--space-16` | 4rem | 64px |

---

## 5. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-xs` | 0.25rem | Tags inner items |
| `--radius-sm` | 0.4375rem | Badges, small chips |
| `--radius-md` | 0.625rem | Buttons (sm), inputs |
| `--radius-lg` | 0.875rem | Default cards |
| `--radius-xl` | 1.125rem | Large cards, modals |
| `--radius-2xl` | 1.5rem | Hero sections, auth cards |
| `--radius-full` | 9999px | Avatars, pills, badges |

---

## 6. Shadow & Elevation System

5 elevation levels + 2 brand glows:

| Level | Token | Usage |
|-------|-------|-------|
| 1 | `--shadow-xs` | Subtle dividers |
| 2 | `--shadow-sm` | Default cards |
| 3 | `--shadow-md` | Interactive cards (glass) |
| 4 | `--shadow-lg` | Hovered cards, dropdowns |
| 5 | `--shadow-xl` | Modals, overlays |
| Brand | `--shadow-primary` | Primary CTA buttons |
| Brand | `--shadow-secondary` | Gold featured buttons |

---

## 7. Animation & Motion

### Easing Curves
| Name | Curve | Usage |
|------|-------|-------|
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Buttons, modals, popups — feels alive |
| `--ease-smooth` | `cubic-bezier(0.22, 1, 0.36, 1)` | Cards, page transitions |
| `--ease-out`    | `cubic-bezier(0.16, 1, 0.30, 1)` | Overlays entering |

### Durations
| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 150ms | Hover states, color swaps |
| `--duration-normal` | 280ms | Card hover, input focus |
| `--duration-slow` | 450ms | Page transitions, modals |

### Principles
- **Only animate** `transform` and `opacity` for 60fps (no `width`, `height`, `top`, `left`)
- **Always** include `prefers-reduced-motion` override (already in `index.css`)
- Button hover: `translateY(-2px)` lift with spring easing
- Card hover: `translateY(-3px)` + increased shadow
- Never auto-play animations faster than 150ms to avoid motion sickness

---

## 8. Glassmorphism Rules

The platform uses glassmorphism as a calm premium surface, not a flashy one:

```css
/* Correct usage */
.element {
  background: var(--glass-bg);          /* rgba with opacity ~72% */
  backdrop-filter: var(--glass-blur);   /* blur(20px) saturate(180%) */
  border: 1px solid var(--glass-border);
}
```

**When to use glass:**
- Header when scrolled
- Sidebar panels
- Floating cards over imagery
- Modal overlays

**Do NOT use glass on:**
- Body text containers
- Simple list items
- Form inputs (use solid `--input-background`)

---

## 9. Components

### Button
- **Primary**: Emerald fill, `--shadow-primary` glow, spring hover lift `-2px`
- **Gold**: Secondary fill, `--shadow-secondary` glow
- **Outline**: Transparent with emerald border on hover
- **Ghost**: No border, subtle accent background on hover — lift disabled
- **Link**: Text-only, no lift
- Min height: **44px** on mobile (touch target)
- Loading state: Built-in spinner with children text

### Input
- Default border: `--input-border`
- Focus border: `--primary`, glow ring `rgba(13, 148, 136, 0.12)`
- Use `.input-glow` wrapper class for focus glow
- Support floating label via `.floating-label-wrapper`

### Card
- **Glass card** (`.premium-glass-card`): Default interactive cards
- **Gold card** (`.premium-gold-card`): Featured / top contributor
- **Surface card** (`.surface-card`): Static, no hover lift
- Border radius: always `--radius-lg` (0.875rem) minimum

### Badge / Tag
- Tags use `.tag-pill` class for hover spring animation
- Reputation tiers: color-coded via semantic tokens
- Max width: truncate at 120px on mobile (`.truncate-mobile`)

### Avatar
- Ring on hover: `ring-2 ring-primary/50`
- Size S: 32px, M: 36px, L: 48px, XL: 64px

### Bottom Navigation
- Max **4 items** only
- Active state: primary color icon + dot indicator
- Never use floating action button AND bottom nav simultaneously

---

## 10. Layout Rules

### Breakpoints
| Name | Width | Behavior |
|------|-------|----------|
| xs | 480px | Show brand name, notifications |
| sm | 640px | 2-col grids, larger touch targets |
| md | 768px | Show desktop search, sidebar |
| lg | 1024px | Full 3-col layout |
| xl | 1280px | Wider max-width containers |

### Grid
- Max content width: **1280px** (`max-w-7xl`)
- Page padding: `px-3 sm:px-4 md:px-6`
- Sidebar: **220px** fixed, appears at `md`
- Main feed: `flex-1 min-w-0`
- Right aside: **288px** fixed, appears at `lg`

### RTL Rules
- Use `gap`, `space`, and `flex` — not `margin-left`/`margin-right` hacks
- Icons that are directional: add `.flip-rtl` class
- Code blocks: `direction: ltr; text-align: left`
- All absolute positions are relative to RTL context

---

## 11. Iconography

- **Library**: Lucide React exclusively
- Size: 16px (4w/h) standard, 20px for prominent, 24px for hero
- Color: inherit from parent or explicit token — never hardcoded hex
- **No emojis** anywhere in the UI (replaced with Lucide icons)

---

## 12. Accessibility

| Rule | Standard |
|------|----------|
| Color contrast body | ≥ 4.5:1 (WCAG AA) |
| Color contrast large text | ≥ 3:1 |
| Touch targets | ≥ 44×44px |
| Focus ring | `2px solid var(--primary)`, `outline-offset: 3px` |
| Reduced motion | Honored via `prefers-reduced-motion` media query |
| Screen reader | ARIA labels on all icon-only buttons |

---

## 13. Dark Mode

- Default: **dark** (user preference saved to localStorage)
- Toggle: header sun/moon icon with spring animation
- Key differences in dark:
  - Background: obsidian `hsl(180, 22%, 7%)`
  - Primary color brightens slightly to `hsl(170, 90%, 42%)`
  - Shadows use pure black with higher opacity
  - Glass uses dark base `rgba(15, 28, 28, 0.72)`

---

## 14. Backend Readiness

- **Auth state**: Read from `AppStateContext.currentUser` — swap with JWT decode
- **Protected routes**: `<ProtectedRoute require="user|admin">` wraps private pages
- **Data fetching**: Replace mock arrays with `useQuery` or `fetch` calls
- **LocalStorage keys**: `khapeer_*` — migrate to server-side session when ready
- **Scroll restoration**: Handled by `<ScrollRestoration />` in layout — works with SSR too
