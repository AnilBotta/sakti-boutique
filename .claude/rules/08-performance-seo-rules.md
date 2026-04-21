# 08 — Performance, SEO & Accessibility Rules

## Core Web Vitals Targets
- **LCP** under 2s on mobile 4G
- **CLS** under 0.05
- **INP** under 200ms
- **TTFB** under 600ms on cached routes

## Performance Practices
- Server-first rendering; ship the smallest possible client JS
- Route-level code splitting
- Lazy-load below-the-fold sections and heavy widgets (try-on, lookbook galleries)
- Prefetch likely next routes (category → PDP)
- Avoid blocking third-party scripts in the critical path

## Image Optimization
- Use `next/image` everywhere, never raw `<img>`
- Serve modern formats (AVIF / WebP) via Supabase Storage transforms or a CDN
- Provide explicit `width` / `height` to prevent layout shift
- Responsive `sizes` attribute on every product image
- Compress and right-size hero, gallery, and lookbook assets

## SEO
- Per-page `<title>` and meta description
- Canonical URLs on every page
- `sitemap.xml` and `robots.txt` generated from the catalog
- Clean, human-readable slugs that match the locked category tree
- Open Graph and Twitter card metadata for social sharing

## Structured Data (JSON-LD)
- `Product` with name, image, brand, sku, offers
- `Offer` with price, priceCurrency, availability
- `BreadcrumbList` on category and product pages
- `Organization` on the homepage
- `Review` / `AggregateRating` once review data is live

## Accessibility (WCAG AA)
- Semantic landmarks (`header`, `nav`, `main`, `footer`)
- Visible focus rings on every interactive element
- Color contrast checked against AA on every accent usage
- Alt text on all product imagery
- Forms with associated labels and inline error messaging
- Drawers and modals trap focus and restore it on close

## Analytics & Conversion
- GA4 or Plausible — provider-agnostic event layer
- Track: view_item, add_to_cart, begin_checkout, purchase, tryon_started, tryon_completed
- Newsletter signup as a tracked conversion
- Respect cookie consent where required

## Release Gates
- Lighthouse run on home, category, PDP, and checkout before every release
- Performance regressions and a11y violations are launch blockers, not nice-to-haves
