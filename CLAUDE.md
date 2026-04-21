# CLAUDE.md — Sakti Boutique

Sakti Boutique is a **premium ethnic fashion ecommerce web app** for Women, Men, and Kids. The brand is luxurious, editorial, festive, culturally rich, and conversion-focused. The site is **mobile-first** and polished enough that no separate mobile app is needed initially.

This file is the north-star brief. **Detailed guidance lives in `.claude/rules/`** — read those files before doing any non-trivial work.

---

## Locked Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Motion:** Framer Motion
- **Backend:** Supabase (Postgres, Auth, Storage, RLS)
- **Payments:** Stripe
- **Cart / local UI state:** Zustand
- **Server state:** React Query / TanStack Query

Do not re-litigate the stack without a strong, project-specific reason.

---

## Mandatory Skills

- **`frontend-design`** — MUST be used for any UI/page/section build, redesign, responsive work, motion, or visual polish. Primary skill for this project.
- **`skill-creator`** — Use when a recurring Sakti Boutique workflow deserves its own reusable skill.
- **`anthropic-skills:pdf` / `xlsx`** — For invoices, reports, exports, and admin documents when needed.

---

## Top Priorities

1. **Premium boutique quality** — editorial, elegant, never generic.
2. **Mobile-first responsiveness** — every screen, every interaction.
3. **Storefront excellence** — homepage, PDP, cart, checkout, accounts.
4. **Serious admin panel** — products, inventory, orders, fulfillment, customers, content.
5. **AI Virtual Try-On / Try Me** — first-class differentiator, provider-agnostic.
6. **Amazon-readiness** — channel-aware data model; storefront stays brand-first.
7. **Performance + SEO** — LCP < 2s, structured data, accessibility.

---

## Non-Negotiables

- No generic template UI; no downgrading of premium quality.
- Mobile-first from day one. Server-first components, client only when needed.
- Warm palette as refined accents on a white base — never full-bleed.
- Admin and Try-On are core features, not afterthoughts.
- Reusable components and a consistent design system across storefront and admin.

---

## Detailed Rules — read before touching the matching area

| File | Scope |
|---|---|
| `01-product-brief.md` | Identity, audience, locked category tree, static pages |
| `02-design-system.md` | Palette, typography, spacing, tokens, ecommerce aesthetic |
| `02b-motion-and-interaction-rules.md` | Motion philosophy, scroll, parallax, panel-settle, depth, reduced-motion |
| `02c-component-tone-and-layout-rules.md` | Per-component tone, admin variants, mobile-first premium UX |
| `03-storefront-rules.md` | Homepage, nav, PDP, cart, checkout, accounts, reviews |
| `04-admin-panel-rules.md` | Dashboard, products, inventory, orders, fulfillment, content |
| `05-tryon-rules.md` | Try-On UX, privacy, provider-agnostic architecture |
| `06-backend-data-rules.md` | Supabase schema, RLS, Zustand/React Query boundaries |
| `07-amazon-integration-rules.md` | Channel-aware modeling, ASIN/SKU, publish flags |
| `08-performance-seo-rules.md` | Core Web Vitals, metadata, structured data, a11y |

Always invoke `frontend-design` for UI work.
