# SEO Content — <Page Name>
_Date: YYYY-MM-DD · Target: <URL or route>_

## 1. Research Notes
<Bullet summary of competitor findings. Cite each source URL. Note title/meta patterns, H1/H2 structure, PDP length, schema usage, and editorial flourishes worth borrowing.>

- [competitor.com](https://competitor.com) — …
- [competitor.com](https://competitor.com) — …

## 2. Keyword Map
**Primary:** <1–2 high-intent terms>
**Secondary:** <3–5 long-tail buyer-intent terms>
**LSI / Semantic:** <8–15 fabric, craft, region, occasion terms>

## 3. Meta Tags (ready to paste)

```ts
export const metadata: Metadata = {
  title: '…', // ≤ 60 chars
  description: '…', // ≤ 155 chars
  openGraph: {
    title: '…', // ≤ 70 chars
    description: '…', // ≤ 200 chars
  },
};
```

Character counts: title <n> · description <n> · OG title <n> · OG description <n>

## 4. Page Copy

### Eyebrow
<2–4 words>

### H1
<≤ 60 chars>

### Intro / Lede
<1–3 sentences, editorial tone>

### Body
<Section-by-section copy with H2s. Respect the block structure for the page type: homepage hero / category landing / PDP 6-block.>

### CTAs
- Primary: `<label>` → `<route>`
- Secondary: `<label>` → `<route>`

## 5. FAQ (with JSON-LD)

**Q1.** <question>
**A1.** <2–4 sentence answer, 1 primary keyword woven in>

**Q2.** …

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "…",
      "acceptedAnswer": { "@type": "Answer", "text": "…" }
    }
  ]
}
</script>
```

## 6. Internal Linking Suggestions
- From this page → <related routes>
- To this page from → <parent / sibling routes>

## 7. Notes for the Content Team
- `[VERIFY]` <any factual claim — origin, fabric, shipping, certification — that must be confirmed before launch>
- <Follow-up research needed>
- <Imagery or asset asks>
