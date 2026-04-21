# 02c — Component Tone & Layout Rules

How each component should *feel* and behave. Read with `02-design-system.md` (tokens) and `02b-motion-and-interaction-rules.md` (motion).

---

## 1. Tone Matrix

| Component | Soft↔Sharp | Dense↔Airy | Shadow↔Border | Bold↔Restrained | Editorial↔Utility |
|---|---|---|---|---|---|
| Header / Nav | Sharp | Airy | Border | Restrained | Editorial |
| Announcement bar | Sharp | Dense | None | Restrained | Utility |
| Mega menu | Soft | Airy | Shadow.lift | Restrained | Editorial |
| Mobile drawer | Soft | Airy | Shadow.float | Restrained | Editorial |
| Hero block | Sharp | Airy | None | Bold | Editorial |
| Section heading | Sharp | Airy | None | Bold | Editorial |
| Category card | Sharp | Airy | None | Bold | Editorial |
| Product card | Sharp | Airy | None | Restrained | Editorial |
| CTA / button | Soft | Dense | None | Bold | Utility |
| Badge | Soft | Dense | Border | Restrained | Utility |
| Filter / chip | Soft | Dense | Border | Restrained | Utility |
| Form input | Soft | Dense | Border | Restrained | Utility |
| Newsletter | Sharp | Airy | None | Restrained | Editorial |
| Trust card | Sharp | Airy | None | Restrained | Utility |
| Testimonial | Soft | Airy | Border | Restrained | Editorial |
| Footer | Sharp | Airy | None | Restrained | Editorial |
| Admin table | Sharp | Dense | Border | Restrained | Utility |
| Admin sidebar | Sharp | Dense | Border | Restrained | Utility |
| Admin form | Soft | Dense | Border | Restrained | Utility |

---

## 2. Storefront Components

### Header / Navbar
- Height: **72px** desktop, **60px** mobile.
- White background, hairline bottom border. No shadow at rest.
- Logo left, primary nav center, utility (search/account/wishlist/cart) right.
- Sticky on scroll: shrinks to **56px** desktop, gains `shadow.rest`, transitions over `dur.base`.
- Active link: 1px `accent.ember` underline beneath label, animated from left.

### Announcement Bar
- Height: **36px**. `bg.muted` background. Single line of copy, eyebrow style.
- Dismissible. Never carries countdowns.

### Mega Menu (Desktop)
- Drops below header, full container width.
- 4 columns: 1 categories, 1 subcategories, 1 featured collection card, 1 editorial image with caption link.
- Padding `py-10 px-12`. `shadow.float`. Opens on hover with 120ms intent delay.

### Mobile Drawer
- Right-side `Sheet` (shadcn). Full height, **88vw** width, max 420px.
- Accordion category list. Tap targets ≥ 48px. Eyebrow labels for sections.
- Footer of drawer holds account/wishlist links and language/region.

### Hero Blocks
- Full-bleed image, content inset to `container.editorial`.
- Eyebrow + display heading + 1–2 lines of body + single CTA.
- 80vh desktop / 72vh mobile. Min height 560px desktop, 520px mobile.
- Cinematic motion choreography per `02b §10`.

### Section Headings
- Eyebrow (uppercase, `accent.ember` or `text.muted`) + H2 + optional one-line lede.
- Always left-aligned on desktop. Center alignment only on hero and trust strip.
- Underline accent (1px, 32px wide, `accent.ember`) optional below eyebrow.

### Category Cards
- Tall aspect (3:4 or 4:5). Image-led, label overlaid bottom-left or below image.
- No background fill, no border. Hover: image scale 1.03, label slides up 4px.

### Product Cards
- Image (3:4), title (Body), price row (Price token), optional badge top-left.
- No border, no shadow at rest. Hairline divider only between rows when in list view.
- Hover (desktop only): swap to second image with crossfade `dur.base`. No card lift.
- Wishlist heart top-right, appears on hover, always visible on touch.
- Variant swatches below price, max 4 visible + "+N".

### CTAs / Buttons
- Variants: `primary` (ember filled, white text), `secondary` (charcoal outline), `ghost`, `link`.
- Sizes: `sm 36`, `md 44`, `lg 52`. Min 44px on touch.
- Radius `radius.md`. No gradient, no shadow.
- Press: `scale(0.985)`. Focus: 2px ember outline + 2px offset.

### Badges
- 11px eyebrow, 6/10 padding, 2px radius, hairline border, accent text on white.
- Max one per card. No filled-color tags.

### Filters / Chips
- Pill, hairline border, `radius.md`. Selected state: `bg.muted` fill + `accent.ember` text + ember border.
- Filter sidebar on desktop, bottom sheet on mobile.

### Forms
- Top-aligned eyebrow labels. Inputs 44px tall, `radius.md`, hairline border.
- Focus: ember 2px ring. Error: `state.danger` border + caption below.
- Helper text in `text.muted` Caption.
- Never floating labels. Never inline labels.

### Newsletter Block
- Section, not modal. `bg.subtle` background allowed here.
- Eyebrow + H2 + one-line lede + email input + button (inline on desktop, stacked on mobile).
- Privacy line in Caption below.

### Trust Cards
- Row of 3–4. Mono-line icon, label (eyebrow), one-line copy.
- No backgrounds, no borders. Hairline divider above the row.

### Testimonial Cards
- Hairline border, `radius.lg`, `p-8` padding.
- Quote (Body L, italic optional), customer name (eyebrow), small avatar optional.
- Carousel on mobile (snap), grid 2–3 on desktop.

### Footer
- 4 columns desktop / accordion mobile.
- `py-20` top, `py-10` bottom. `bg.canvas` with hairline top border.
- Sections: Shop / Help / About / Connect. Newsletter optional in column 4.
- Bottom row: logo, copyright, payment icons, language toggle.

---

## 3. Admin Components

Admin shares tokens but compresses density and reduces editorial chrome.

### Admin Sidebar
- 240px wide, fixed left. `bg.subtle` background. Hairline right border.
- Nav items: 36px tall, 14px label, 16px icon, 12px gutter.
- Active: `bg.muted` + `accent.ember` left bar (3px).

### Admin Tables
- Hairline borders, zebra OFF.
- Row height 48px. Header row 40px, eyebrow style labels, sortable.
- Inline actions in last column. Bulk select checkbox first column.
- Sticky header on scroll. Pagination footer 56px.

### Admin Forms
- Two-column layout where space allows: label/help left, input right.
- Section cards with `radius.lg`, hairline border, `p-6`.
- Save bar sticky bottom, `shadow.lift`, contains primary + cancel.

### Admin Dashboard Cards
- Hairline border, `p-6`, `radius.lg`. Stat label (eyebrow) + number (32px medium) + delta (Caption).

---

## 4. Mobile-First Premium UX

### Touch Targets
- All interactive elements **≥ 44px**. Critical CTAs **≥ 48px**.
- Spacing between adjacent tap targets ≥ 8px.

### Spacing
- Section padding never below `py-14`.
- Side gutters always `px-5` minimum.
- Stack content with `gap-6` between blocks; never crammed.

### Drawer Behavior
- Right or bottom sheet, never modal-center.
- Backdrop `rgba(15,15,15,0.4)`, fade in `dur.fast`.
- Drawer slide `dur.base`, `ease.standard`. Body scroll locked when open.
- Close: tap outside, swipe down/right, or explicit X.

### Sticky Nav
- Header sticky always. Hides on scroll-down beyond 200px, returns on scroll-up.
- Cart icon always visible.

### Motion Simplification
- Disable parallax, panel-settle, ambient loops, sticky cross-fades.
- Reveals replaced with shorter fade-rise (`translateY 12 → 0`, `dur.base`).

### Stack Order
- Hero → primary CTA section → category entry points → featured collection → editorial → trust → newsletter → footer.
- Editorial blocks: image first, then heading, then copy, then link.

### Thumb Zones
- Primary CTAs in middle/lower third of viewport on landing screens.
- Sticky "Add to Cart" bar on PDP, anchored bottom, height 64px, safe-area aware.

### Mobile Hero
- Image fills viewport, content overlays bottom-third with bottom gradient scrim.
- Headline ≤ 3 lines. CTA full-width or wide pill. Eyebrow above headline.

### Product Card on Narrow Screens
- 2-column grid maintained, never single-column dump.
- Title 2-line clamp. Price always visible. Wishlist always visible (no hover gating).
- Tap target wraps the entire card.

### Luxury Preservation
- Whitespace doesn't collapse — it scales proportionally.
- Imagery dominates the viewport; text is concise.
- Motion is calmer, not removed entirely.
- Type stays at storefront scale; never shrink Body below 15px.

---

## 5. Restraint Checklist (run before any UI ships)
- [ ] One dominant CTA per viewport.
- [ ] Max two accent colors used on the page.
- [ ] No more than three type sizes per section.
- [ ] One signature motion per page.
- [ ] All touch targets ≥ 44px.
- [ ] Reduced-motion path verified.
- [ ] No animation on `width`/`height`/`top`/`left`.
- [ ] No badges stacked on a single card.
- [ ] Hairline borders preferred over heavy strokes.
- [ ] Section padding meets rhythm minimums.
