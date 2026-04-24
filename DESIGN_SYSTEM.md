# Lawn Garden Frontend Design System

This file is the design source of truth for this repository.
When implementing or updating UI, follow these rules first.

## 1) Design Direction
- Theme: warm garden notebook + playful signboard interactions
- Tone: friendly, soft, nature-first
- Visual language: rounded cards, mint/green accents, earth-tone action buttons
- Avoid generic dashboard blocks unless explicitly requested

## 2) Color Tokens
Defined in `src/index.css`:

- `--color-background`: `#fdfaf6`
- `--color-light-green`: `#99bc85`
- `--color-deep-green`: `#3d8d7a`
- `--color-container-background`: `#faf1e6`
- `--color-content-font`: `#685752`

Usage rules:
- Prefer token usage over hardcoded values.
- Hardcoded values are allowed only for special illustrations/effects.

## 3) Layout Primitives

### `Wrapper` (`src/styles/Wrapper.tsx`)
- Centered vertical stack
- Route transition animation (framer-motion)
- Use as the root wrapper for almost all pages

### `Container` (`src/styles/Container.tsx`)
- Primary card surface for content pages
- Width: `90vw`, max `770px`
- Radius: `30px`
- Base padding: around `1.2rem`

### `PageHeader` (`src/components/PageHeader.tsx`)
- Left back button + centered title + optional right action
- Title color: deep green

## 4) Typography
- Header title (`PageHeader h1`): `1.8rem`, bold
- Section title (e.g. `BlockLabel`): `1.3rem`, bold
- Small helper text (`SignText`): `14px`
- Keep body text in readable mid-size range (`0.9rem`~`1rem`)

## 5) Shape, Spacing, Elevation
- Card radius: `18px`~`30px`
- Pill buttons/inputs: `50px` radius
- Item/list row radius: very rounded (`999px`) for soft chips
- Default light shadow: `0 2px 6px rgba(0, 0, 0, 0.05)`
- Typical gaps: `0.5rem`, `0.85rem`, `1.2rem`

## 6) Components

### Primary button (`src/components/Button.tsx`)
- Rounded pill, green text on light background by default
- Use `$bgColor`, `$textColor` only when necessary

### Input (`src/components/Input.tsx`)
- Rounded pill shape
- Surface uses `--color-container-background`

### Arrow navigation button (`src/components/ArrowButton.tsx`)
- Main navigation identity component
- Earth-tone brown base (`#997C70`)
- Supports left/right/center direction clipping
- Keep this style for the main signboard navigation pattern

### User list (`src/styles/UserList.tsx`)
- Rounded list chips with soft shadow
- Used in participant/check pages

## 7) Page-Level Patterns

### Main page
- Greeting + arrow-sign navigation is the core pattern
- Do not reintroduce generic metrics cards unless requested

### Check page
- Two side-by-side cards (certified / uncertified)
- Match card padding and shadow with other content cards

### Participant page
- Search + paginated rounded list
- Stats count is secondary; user list visibility is primary

### MyGarden page
- Illustrated frame view + progress bar + GitHub grass chart
- Preserve warm card backgrounds and rounded blocks

## 8) Motion
- Use existing `Wrapper` animation for route/page entrance
- Avoid heavy per-component animation unless needed
- Keep transitions subtle and purposeful

## 9) Responsiveness
- Mobile first fallback is required for all new UI
- Typical pattern: stack columns under `768px`
- Replace fixed `vh` widths with `100%` on mobile where needed

## 10) Do / Don't

Do:
- Reuse existing primitives (`Wrapper`, `Container`, `PageHeader`)
- Keep warm palette and rounded geometry
- Keep interaction states clear (hover/focus/click)

Don't:
- Introduce unrelated dark-theme defaults
- Drop in Vite scaffold styling patterns into product pages
- Replace signboard identity with generic admin UI

---

If design decisions conflict, prioritize:
1) Current page identity
2) This document
3) Existing component patterns in `src/components` and `src/styles`
