# Khapeer (خبير) — Design System Master

> Arabic-first Q&A knowledge community. Tone: **Calm · Premium · Stable · Arab-First**  
> Palette: **Emerald Wisdom** + **Desert Gold** on warm cream (light) / obsidian night (dark)

## Product Context

| Dimension | Direction |
|-----------|-----------|
| Product type | Community Q&A / knowledge forum |
| Audience | Arabic-speaking learners, professionals, local experts |
| Primary job | Ask questions, get trusted answers, build reputation |
| Differentiator | Premium editorial feel — not generic Stack Overflow clone |

## Aesthetic Direction (Frontend Design)

**Concept:** *Majlis of Knowledge* — a modern digital gathering place where wisdom (emerald) meets reward (gold).

- **Typography:** Tajawal (headings) + Cairo (body) + Outfit (numerals) — already distinctive for Arabic UI
- **Spatial:** Bento hero on home, glass cards, generous RTL rhythm (line-height 1.85)
- **Atmosphere:** Subtle arabesque mesh, ambient glow orbs, restrained motion
- **Avoid:** Purple-on-white AI slop, Inter/Roboto, emoji icons, decorative-only animation

## Color Tokens (use semantic names — never raw hex in components)

| Token | Role |
|-------|------|
| `--primary` | Emerald — CTAs, links, active nav, upvotes |
| `--secondary` | Desert gold — badges, reputation, featured content |
| `--success` | Answered / positive states |
| `--destructive` | Downvotes, errors, logout |
| `--muted` / `--muted-foreground` | Secondary text, surfaces |
| `--background` / `--card` | Page and elevated surfaces |

## Typography Scale

| Role | Size | Weight |
|------|------|--------|
| Body | 16px (`--text-base`) | 400 |
| Labels | 14px | 600 |
| H1 | clamp 1.625–2.5rem | 800 |
| H2 | clamp 1.3–1.75rem | 700 |
| Captions | 10–12px | 500 |
| Numbers | Outfit, tabular-nums | 600 |

## Spacing & Layout

- Base unit: **4px** (`--space-1` through `--space-24`)
- Mobile-first breakpoints: 375 / 640 / 768 / 1024 / 1280
- Max content width: `max-w-7xl`
- Bottom nav safe area: `env(safe-area-inset-bottom)`
- Desktop: sidebar (w-60) + main feed + optional right panel (w-72)

## Elevation

| Level | Token | Use |
|-------|-------|-----|
| 1 | `--shadow-xs` | Subtle borders |
| 2 | `--shadow-sm` | Default cards |
| 3 | `--shadow-md` | Interactive cards (`.premium-glass-card`) |
| 4 | `--shadow-lg` | Hover lift |
| Brand | `--shadow-primary` / `--shadow-gold` | CTAs, featured |

## Motion

| Token | Value | Use |
|-------|-------|-----|
| `--duration-fast` | 150ms | Press feedback |
| `--duration-normal` | 280ms | State transitions |
| `--ease-spring` | cubic-bezier(0.34, 1.56, 0.64, 1) | Buttons, tags |
| `--ease-smooth` | cubic-bezier(0.22, 1, 0.36, 1) | Page enter |

**Rules:** Max 1–2 animated elements per view. Respect `prefers-reduced-motion`. Exit faster than enter.

## Navigation

| Breakpoint | Pattern |
|------------|---------|
| Mobile | Bottom nav (≤5 items) + FAB for new question |
| Desktop | Sticky header + left sidebar + optional right panel |

- Active state: color + background pill + bottom dot (mobile)
- Deep linking: all screens URL-routable
- Back behavior: preserve scroll via React Router `ScrollRestoration`

## Components

### Question Card
- Glass card with vote column, title, tags, author footer
- Hover: top accent line + lift (`translateY(-3px)`)
- Tags: pill style with `.tag-pill` hover → primary fill

### Vote Buttons
- Up: primary gradient when active
- Down: destructive when active
- Count: tabular nums, color reflects vote direction

### Header
- Glass on scroll, Cmd+K search, theme toggle, notifications badge
- Logo: emerald circle + Zap icon

## Accessibility Checklist (CRITICAL)

- [x] Contrast ≥4.5:1 body text (test both themes)
- [x] Focus rings: `outline-ring/50` on all interactive elements
- [x] Touch targets ≥44×44px on mobile
- [x] `aria-label` on icon-only buttons
- [x] Skip link to main content
- [x] `prefers-reduced-motion` respected
- [x] Form labels visible (not placeholder-only)
- [x] RTL: `dir="rtl"` + icon flip utility `.flip-rtl`

## Anti-Patterns (Do Not)

- Raw `text-green-600`, `bg-neutral-900` — use semantic tokens
- Undefined CSS vars (e.g. `--gradient-primary` must exist)
- Emoji as navigation icons
- Hover-only interactions (mobile has no hover)
- More than 5 bottom nav items
- Layout-shifting press states

## Page Overrides

See `design-system/pages/` for page-specific deviations. If no override exists, use this Master exclusively.
