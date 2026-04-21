# 02 — Design System (Visual Language)

Canonical visual rules for Sakti Boutique. Companion files:
- `02b-motion-and-interaction-rules.md` — motion, scroll, depth, hover
- `02c-component-tone-and-layout-rules.md` — per-component tone & mobile-first UX

Future page/component prompts MUST conform to these three files. Do not invent new tokens or scales.

---

## 1. Premium Brand Visual Language

"Premium editorial boutique" for Sakti means:
- Magazine-grade composition: large imagery, generous whitespace, restrained type, strong vertical rhythm.
- Garments are the heroes. Chrome (badges, chips, borders) recedes.
- Cultural richness expressed through **photography and copy**, not through color floods or ornament.
- Confidence through restraint: one focal point per section, one dominant CTA per viewport.

### Premium choices (do)
- White canvas, deep charcoal type, refined warm accents used sparingly.
- Editorial asymmetry: off-grid image placement, oversized headings, captions that breathe.
- Tall product imagery (4:5 or 3:4) with consistent crop discipline.
- Hairline dividers (1px, neutral-200) instead of heavy rules.
- Soft, low-spread shadows (`shadow-sm`/custom `0 8px 30px rgba(15,15,15,0.06)`).
- Generous section padding on desktop; intentional rhythm on mobile.

### Cheap / generic choices (avoid)
- Full-bleed warm gradients, rainbow festive blocks, glitter, sparkles.
- Stock-template hero carousels with bullet dots and arrows.
- Discount-store red banners, neon CTAs, blinking badges.
- Heavy drop shadows, hard 4px borders, gradient buttons.
- Cluttered product cards with 5+ chips, ribbons, and stickers.
- Mixed type families, inconsistent radii, ad-hoc color usage.

---

## 2. Color System

### Tokens
Configure in `tailwind.config.ts` under `theme.extend.colors` as semantic aliases:

| Token | Value | Use |
|---|---|---|
| `bg.canvas` | `#FFFFFF` | Page background |
| `bg.subtle` | `#FAF8F5` | Section alt background (warm off-white, sparingly) |
| `bg.muted` | `#F4F2EE` | Card/section fill, hover surfaces |
| `border.hairline` | `#ECE8E1` | 1px dividers, card borders |
| `border.default` | `#E2DDD3` | Inputs, stronger borders |
| `text.primary` | `#1A1714` | Headings, body |
| `text.secondary` | `#5C554C` | Sub-copy, captions |
| `text.muted` | `#8A8278` | Meta, helper text |
| `accent.saffron` | `#E4A13B` | Highlights, badges |
| `accent.ember` | `#C75A1E` | Burnt orange — primary CTA |
| `accent.crimson` | `#A8201A` | Rich red — sale/limited |
| `accent.magenta` | `#9B2C5E` | Editorial moments |
| `accent.plum` | `#5B2A4E` | Deep purple — luxe accents |
| `state.success` | `#3E7A4E` | Stock/confirmations |
| `state.danger` | `#A8201A` | Errors only |

### Accent Hierarchy
1. **Primary action color:** `accent.ember` — the single dominant CTA per viewport.
2. **Editorial accent:** `accent.plum` or `accent.magenta` — section flourishes, headline underlines.
3. **Highlight:** `accent.saffron` — small badges (New, Festive), selected states.
4. **Sale/limited:** `accent.crimson` — sparingly, never as section background.

### Allowed
- Accents on: buttons, links, badges, selected chips, focus rings, small icons, 1–2px underlines.
- Up to **two accents per page**. One dominant, one supporting.
- Warm-tinted off-white (`bg.subtle`) for at most **one** alternating section per page.

### Forbidden
- Full-bleed warm backgrounds across hero or large sections.
- Two saturated accents adjacent (e.g., crimson next to magenta).
- Warm text on warm background.
- Gradient buttons, gradient headlines.
- Color used to imply hierarchy where type weight or spacing would suffice.

### Contrast
- Body text vs background: ≥ 7:1 (AAA where possible).
- All accents on white must pass AA (4.5:1) for text use; otherwise treat as decorative only.

---

## 3. Typography

### Family
- **Primary:** Inter or Roboto Flex (variable). Fallback: `ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif`.
- One family across storefront and admin. No serif display fonts unless approved.

### Storefront Scale
| Role | Size (mobile → desktop) | Weight | Line-height | Tracking |
|---|---|---|---|---|
| Display (hero) | 40 → 72px | 500 | 1.05 | -0.02em |
| H1 | 32 → 48px | 500 | 1.1 | -0.015em |
| H2 (section) | 24 → 36px | 500 | 1.15 | -0.01em |
| H3 | 20 → 24px | 500 | 1.25 | -0.005em |
| Body L | 17 → 18px | 400 | 1.6 | 0 |
| Body | 15 → 16px | 400 | 1.6 | 0 |
| Caption | 13 → 13px | 400 | 1.5 | 0.01em |
| Eyebrow / label | 11 → 12px | 500 | 1.2 | 0.14em uppercase |
| Button | 14 → 15px | 500 | 1 | 0.02em |
| Price | 16 → 18px | 500 | 1.2 | 0 (tabular-nums) |

- Editorial headings: medium weight (500), tight tracking, never bold-black.
- Eyebrows above section headings establish editorial rhythm.
- Body uses humanist sans, never condensed.
- Prices use `font-variant-numeric: tabular-nums`.

### Admin Variant
- Same family. Compress sizes by ~1 step. Body 14px. Headings cap at 24px. Tighter line-heights (1.4 body, 1.2 headings). Utility-first; minimal eyebrows.

### Rules
- Max 3 type sizes visible per section.
- Never mix two heading weights in one block.
- No all-caps body text. All-caps reserved for eyebrows and small labels.

---

## 4. Spacing & Layout

### Spacing Scale
`xs` 8 · `sm` 12 · `md` 16 · `lg` 24 · `xl` 32 · `2xl` 48 · `3xl` 72 · `4xl` 112 · `5xl` 160

### Section Rhythm
- Desktop section padding-y: **96–128px** (`py-24` → `py-32`).
- Mobile section padding-y: **56–72px** (`py-14` → `py-18`).
- Gap between editorial blocks within a section: **48–72px** desktop, **32–48px** mobile.
- Never less than `py-14` on mobile sections.

### Container & Max Widths
- `container.default`: max-width **1280px**, gutter `px-5` mobile / `px-8` tablet / `px-12` desktop.
- `container.editorial`: max-width **1440px** for cinematic sections.
- `container.text`: max-width **64ch** for prose.
- No full-bleed except hero and cinematic dividers.

### Grid Density
- Product grid: 2 cols mobile, 3 cols tablet, 4 cols desktop. Never 5+. Gap 16/24/32.
- Category landing tiles: 1 col mobile, 2–3 cols desktop.
- Editorial blocks: 12-col grid; allow asymmetric 5/7 or 4/8 splits.

### Card Internals
- Product card: image flush, text block `pt-3 pb-1` mobile / `pt-4 pb-2` desktop.
- Standard card padding: `p-6` desktop, `p-5` mobile.
- Internal vertical rhythm: 8 / 12 / 16.

### Whitespace as Luxury
- Headings: `mb-6` desktop / `mb-4` mobile minimum.
- Hero copy block max-width ~ 560px. Lines never exceed 70 characters.
- Trust strip: minimum `py-10` separation from neighbors.

### Mobile Adaptation
- Maintain rhythm; do not collapse to dense grids.
- Stack into single column with intentional spacing, not crammed two-ups.
- Edge-to-edge imagery is allowed on mobile heroes; text always inset by `px-5`.

### Section Templates
- **Hero:** full-bleed image, content inset, 80vh desktop / 72vh mobile cap.
- **Collection rail:** eyebrow + H2 + horizontal scroll on mobile, grid on desktop.
- **Editorial block:** asymmetric image/text split, oversized heading, short paragraph, single text link.
- **Product grid:** breadcrumb + filters bar + grid + pagination.
- **Trust block:** 3–4 icons + label + one-line copy, hairline divider above.
- **Footer:** 4-column desktop / accordion mobile, generous `py-20` top padding.

---

## 5. Ecommerce-Specific Aesthetic

### Product Imagery
- Aspect ratio locked at **4:5** (PDP gallery) and **3:4** (cards).
- Consistent background tone across catalog (white or warm off-white) — no mixing.
- Model shots preferred for hero/collection; flat-lays acceptable for detail.
- No watermarks, no embedded text overlays in product photos.

### Category Banners
- Editorial photography, not graphic illustration.
- Headline overlay sits in lower-left or lower-right thirds, never centered over face.
- Overlay uses white type with subtle bottom-up gradient scrim (`rgba(0,0,0,0.0–0.45)`).

### Price Presentation
- Current price first, in `text.primary`. Strikethrough original after, in `text.muted`, smaller.
- No "% OFF" stamps. Sale state implied by strikethrough + a small `accent.crimson` "Sale" eyebrow.
- Tabular numerals always.

### Sale & Badges
- Max one badge per product card. Priority: New > Best Seller > Festive > Sale.
- Style: 11px eyebrow, 6/10 padding, 2px radius, accent text on white with hairline border. No filled-color tags.

### Wishlist / Cart Icons
- Outline icons, 20px stroke 1.5. Filled state on active.
- Wishlist heart fills `accent.crimson` when active. Cart count uses `accent.ember` dot.

### Trust Signals
- Quiet strip below hero or above footer. Mono-line icons, label + one-line copy. No colored backgrounds.

### Reviews
- Star color: `accent.saffron`. Empty stars: `border.default`.
- Review cards: hairline border, generous padding, customer photo optional.

### Editorial Storytelling
- One editorial section per landing page, max two.
- Long-form copy in `container.text`. Imagery breaks the grid intentionally.

### Conversion without Aggression
- One dominant CTA per viewport.
- No countdown timers, no popups within first 15s, no exit-intent modals.
- Newsletter capture is a quiet section block, not an overlay.

---

## 6. Iconography
- Lucide icons, stroke 1.5, 20px default, 16px in dense UI, 24px in nav.
- Never mix icon libraries.

---

## 7. Radii, Borders, Shadows

| Token | Value |
|---|---|
| `radius.sm` | 2px (badges, inline chips) |
| `radius.md` | 6px (buttons, inputs) |
| `radius.lg` | 10px (cards, modals) |
| `radius.xl` | 16px (feature cards, sheets) |
| `radius.image` | 0px (product imagery — never rounded) |

- Borders default `1px solid border.hairline`. Use `border.default` only for inputs and dividers.
- Shadows:
  - `shadow.rest`: `0 1px 2px rgba(15,15,15,0.04)`
  - `shadow.lift`: `0 8px 30px rgba(15,15,15,0.06)`
  - `shadow.float`: `0 18px 50px rgba(15,15,15,0.10)` (modals, drawers)
- Never combine borders + heavy shadows on the same element.

---

## 8. Hard Bans
- Generic ecommerce template feel.
- Full-bleed warm backgrounds, rainbow gradients, glitter/sparkle effects.
- Rounded product images, polaroid frames, tilted cards.
- Bold-black display type or all-caps body copy.
- Multiple competing CTAs in a single viewport.
- Color-coded category sections (e.g., pink for women, blue for men).
- More than two saturated accents on a page.
- Drop shadows above 24px blur, or any colored shadows.

---

## 9. Implementation Notes (Tailwind + shadcn/ui)
- Define tokens in `tailwind.config.ts` (`theme.extend.colors`, `fontSize`, `spacing`, `borderRadius`, `boxShadow`).
- Wrap shadcn/ui primitives (`Button`, `Card`, `Input`, `Badge`, `Sheet`, `Dialog`) with brand variants — never use shadcn defaults raw.
- Buttons: variants `primary` (ember), `secondary` (outline charcoal), `ghost`, `link`. Sizes `sm 36px`, `md 44px`, `lg 52px`. All ≥44px on touch.
- Forms: top-aligned eyebrow labels; no floating labels.
- Focus ring: `accent.ember` 2px outline with 2px offset (see `08-performance-seo-rules.md`).

> Motion, scroll behavior, depth, and per-component tone live in `02b` and `02c`. Always read both before building UI.
