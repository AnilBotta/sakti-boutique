# 07 — Amazon Integration Rules

## Positioning
- The **Sakti Boutique website is the main branded storefront**.
- **Amazon is a secondary, future sales channel** — never the primary experience.
- The storefront must remain brand-first. Do not design pages, flows, or data around Amazon.

## Channel-Aware Product Modeling
- Products are channel-agnostic at the core.
- A `channel_mappings` table links a product to one or more sales channels.
- Each mapping carries channel-specific identifiers and status.

## Required Fields (Amazon)
- **Amazon SKU** — per variant
- **ASIN** — once listed
- **Publish-to-Amazon flag** — per product
- **Listing status** — draft, pending, listed, error, suppressed
- **Last sync timestamp**
- **Sync error message** (when applicable)

## Sync Readiness
- Inventory adjustments must be propagatable to Amazon when sync goes live.
- Price and sale price changes must be propagatable per channel.
- Order ingestion from Amazon must be possible without changing storefront flows.
- Build the seams now; defer the actual API integration until the channel is activated.

## Admin Surfacing
- Per-product publish-to-Amazon toggle (see `04-admin-panel-rules.md`)
- Listing status visible in product list and detail views
- Bulk publish / unpublish actions
- Error log accessible from the product detail page

## Hard Rules
- Do **not** restructure storefront URLs to match Amazon conventions.
- Do **not** leak Amazon-specific terminology into customer-facing UI.
- Do **not** block storefront features waiting on Amazon.
- Keep the storefront fully functional even if the Amazon channel is disabled.
