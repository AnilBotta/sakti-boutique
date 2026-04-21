# 04 — Admin Panel Rules

The admin is a **core part of the platform**, not an afterthought. Treat it with the same design quality as the storefront, but optimize for operator speed.

## Dashboard
- Today's revenue, orders, AOV
- New orders awaiting action
- Low-stock alerts
- Pending reviews to moderate
- Try-on usage metrics (when available)

## Product Management
- Create / edit / archive products
- Multiple image upload with drag-to-reorder gallery
- Set primary/cover image
- Pricing and **sale pricing** with optional schedule
- Variants: size, color, and combinations with per-variant SKU and stock
- Stock / inventory per variant
- Category and subcategory assignment from the locked tree
- Status: draft, active, archived
- SEO fields: slug, meta title, meta description

## Categories & Subcategories
- Manage names, slugs, banner images, ordering
- Locked top-level structure — additions require business approval

## Orders
- Filterable order list (status, date, customer, channel)
- Order detail view: items, customer, shipping, payment, totals
- Status management: pending → paid → packed → shipped → delivered → cancelled / refunded
- **Fulfillment / shipping / delivery activity timeline** must be visible
- Tracking number entry and carrier link

## Customers
- Customer list with lifetime value and order count
- Customer detail: orders, addresses, wishlist, notes

## Reviews Moderation
- Approve / reject / hide reviews
- Flag inappropriate content
- Reply to reviews from admin

## Content / CMS Pages
- Manage About, FAQ, Contact, lookbook, journal, story pages
- Rich content blocks
- Publish / draft toggle

## Amazon Sync Readiness
- Per-product publish-to-Amazon flag
- ASIN and Amazon SKU fields
- Listing/sync status surfaced in product list and detail
- See `07-amazon-integration-rules.md`

## Try-On Monitoring (Future)
- Job queue, success/failure rates, latency
- Per-product try-on enable toggle

## Admin UX Principles
- Practical and lightweight — no bloat
- Dense but readable tables
- Inline edit where safe
- Bulk actions for products and orders
- Keyboard shortcuts for power users
- Responsive enough to manage from a tablet
