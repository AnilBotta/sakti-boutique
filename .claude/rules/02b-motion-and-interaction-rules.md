# 02b — Motion & Interaction Rules

Motion is a **luxury tool**, never decoration. Every animation must justify itself: clarify hierarchy, reveal content with grace, or reward intent. If it doesn't, it doesn't ship.

Read alongside `02-design-system.md` and `02c-component-tone-and-layout-rules.md`.

---

## 1. Motion Philosophy
- **Restraint over flourish.** Fewer, more deliberate animations beat constant movement.
- **Choreographed, not random.** Sections have one entrance language; elements move in agreement.
- **Premium tempo.** Slower than typical SaaS motion. Easings lean cinematic, not snappy.
- **Performance-first.** GPU-friendly properties only (`transform`, `opacity`, `filter`). Never animate `width`, `height`, `top`, `left`, `box-shadow` on scroll.

---

## 2. Duration & Easing Tokens

| Token | ms | Use |
|---|---|---|
| `dur.instant` | 120 | Toggles, focus rings |
| `dur.fast` | 200 | Hover, button press |
| `dur.base` | 320 | Card lift, drawer chrome |
| `dur.slow` | 560 | Section reveal, image fade-in |
| `dur.cinematic` | 900 | Hero copy, large editorial reveals |
| `dur.settle` | 1200 | Panel-settle / dock transitions |

| Easing | cubic-bezier | Use |
|---|---|---|
| `ease.standard` | `(0.22, 0.61, 0.36, 1)` | Default reveals, hover |
| `ease.entrance` | `(0.16, 1, 0.3, 1)` | Editorial entrance (expo-out) |
| `ease.exit` | `(0.4, 0, 1, 1)` | Dismissals |
| `ease.settle` | `(0.65, 0, 0.35, 1)` | Panel settle / dock |

No spring physics with bounce > 1.0. No overshoot.

---

## 3. Approved Motion Types
- Fade + rise (`opacity 0→1`, `translateY 16→0`).
- Soft scale (`scale 0.98→1`).
- Image cover reveal (clip-path `inset(100% 0 0 0)→inset(0)`).
- Parallax translate on Y axis only, ≤ 12% of viewport.
- Sticky pin + cross-fade between siblings.
- Marquee/horizontal drift for editorial credits, ≤ 30px/s.
- Color/opacity hover transitions.
- Number tickers for stats (cap 1.2s).

## 4. Forbidden Motion
- Rotate beyond ±2°.
- Tilt / 3D perspective transforms on cards.
- Bounce, elastic, jelly easings.
- Continuous looping animation in primary content (background OK if subtle).
- Particle/sparkle systems.
- Page transition wipes that block content > 400ms.
- Animating filters or shadows during scroll.
- Auto-playing carousels with motion.

---

## 5. Hover & Press
- **Hover lift:** `translateY(-2px)` + `shadow.rest → shadow.lift`, `dur.fast`, `ease.standard`. Cards only.
- **Image hover:** inner image `scale(1.03)` over 600ms, container `overflow-hidden`. No tilt.
- **Button press:** `scale(0.985)` + 1px translateY, `dur.instant`.
- **Link hover:** underline grows from left, 1px, 200ms.
- Hover effects MUST be disabled on touch devices (`@media (hover: hover)`).

---

## 6. Entrance / Reveal
- Trigger when element is **15% in viewport** (`amount: 0.15`).
- Default reveal: `opacity 0→1`, `translateY 24→0`, `dur.slow`, `ease.entrance`.
- Stagger children: 60–90ms between siblings, max 6 staggered items per group.
- Reveal **once** (`once: true`). Never re-trigger on scroll up.
- Headlines: split into lines (not letters), reveal line-by-line with 80ms stagger.
- Above-the-fold content reveals on mount, not on scroll.

---

## 7. Scroll-Linked Motion

### Parallax
- Y-axis only. Max offset **12vh**. Apply to background imagery, never to text.
- Use `useScroll` + `useTransform` with `LayoutEffect`-safe refs.
- Disable below 768px width.

### Layered Reveal
- Stack 2–3 elements with progressive offsets (e.g., heading → image → caption) revealing across a 30vh scroll window.
- Offsets decrease as depth increases (background moves least).

### Sticky Sections
- Use sparingly (max one sticky section per page).
- Pin duration ≤ 2× viewport height.
- Cross-fade content within the pinned frame; never freeze the user with no progress feedback.

---

## 8. Panel Settling / Image Docking (Signature Pattern)

A signature Sakti interaction: an image block from one section appears to **settle into the next section's frame** as the user scrolls.

### Spec
- Source: a hero/editorial image positioned within Section A.
- Target: a fixed slot in Section B (often a card or framed region).
- As Section B enters viewport, the source image translates + scales toward the target slot, locking in place once aligned.
- Driven by `useScroll` with `offset: ['start end', 'end start']` on Section B.
- Properties animated: `translateY`, `translateX`, `scale`, `borderRadius` (0 → target radius).
- Duration governed by scroll, not time. Easing `ease.settle`.
- The image must arrive **exactly** at the target slot — measure with `getBoundingClientRect` or shared layout.
- Once docked, image becomes a static element of Section B (handoff via `onAnimationComplete`).

### Restraint
- Use **once per page maximum**.
- Never on mobile (< 768px) — replace with a simple fade-in.
- Never with text content as the source.

---

## 9. Subtle Pseudo-3D / Depth
Depth is implied through **scale, blur, shadow, and spacing** — not real 3D libs.

- Background imagery: `scale(1.05)` + `blur(2px)` + `opacity(0.85)` to recede.
- Foreground cards: `shadow.lift` + sharp focus.
- Layered editorial blocks: 8–16px Z-spacing via shadow + margin offsets.
- Never use `transform: perspective()` or `rotateX/Y` on content cards.
- No CSS 3D, no Three.js, no WebGL in storefront pages.

---

## 10. Hero Cinematic Motion
- On mount: image fades in from `opacity 0.6 → 1` over `dur.cinematic`, paired with a slow `scale(1.04 → 1)` over 6s (ambient).
- Headline: line-by-line reveal, `dur.slow`, 100ms stagger, starts 200ms after image.
- CTA: fade + rise, starts 400ms after headline.
- Eyebrow: appears first, 150ms before headline.
- Total hero entrance choreography ≤ 1.4s before CTA is interactive.
- Ambient scale loop is allowed only on hero, must be GPU-only, must respect reduced-motion.

---

## 11. Reduced Motion (Accessibility)
- Respect `prefers-reduced-motion: reduce` globally.
- Replace transforms with simple `opacity 0→1` over `dur.fast`.
- Disable parallax, panel-settle, ambient loops, and sticky cross-fades entirely.
- Hover lifts collapse to color-only state changes.
- Implement once via a shared `useReducedMotion` hook from Framer Motion; gate variants accordingly.

---

## 12. Mobile Performance Guardrails
- Disable parallax, panel-settle, and sticky pin sections below **768px**.
- Cap concurrent animations to **3** at any time on mobile.
- No `backdrop-filter` on scrolling elements.
- Lazy-mount below-the-fold motion sections.
- Use `will-change` only on the active element, remove after animation.
- Test on mid-tier Android (Moto G class) — frame budget 16ms.

---

## 13. Framer Motion Conventions
- Centralize variants in `lib/motion/variants.ts`. No inline magic numbers in components.
- Centralize tokens in `lib/motion/tokens.ts` (durations, easings).
- Use `motion.div` sparingly — wrap only the element that animates, not entire trees.
- Prefer `whileInView` with `viewport={{ once: true, amount: 0.15 }}` for reveals.
- Use `LayoutGroup` and `layoutId` for shared-element transitions (e.g., panel-settle handoff).
- Always pass explicit `initial`, `animate`, `exit` — never rely on defaults.
- For scroll-linked motion, isolate `useScroll` per section to avoid global listeners.

---

## 14. Interaction Restraint Rules
- One signature interaction per page.
- One ambient loop per page (hero only).
- One scroll-linked sticky section per page.
- Everything else: standard reveal + hover.
- If a page feels "busy" with motion, remove the second-most-prominent animation.
