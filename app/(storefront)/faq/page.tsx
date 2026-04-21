import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/content/PageHero';
import { FaqGroup, type FaqItem } from '@/components/content/FaqGroup';
import { ContentCtaBlock } from '@/components/content/ContentCtaBlock';
import { Section } from '@/components/layout/Section';

export const metadata: Metadata = {
  title: 'Help Center',
  description:
    'Answers to common questions about ordering, shipping, returns, sizing, product care, and our virtual try-on experience at Sakthi Trends USA.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'Help Center · Sakthi Trends USA',
    description:
      'Answers to common questions about ordering, shipping, returns, sizing, and care.',
    type: 'website',
  },
};

const ordersFaq: FaqItem[] = [
  {
    q: 'How do I place an order?',
    a: 'Add pieces to your cart and proceed to checkout. You can check out as a guest or create an account to track orders, save addresses, and keep a wishlist.',
  },
  {
    q: 'Which payment methods do you accept?',
    a: 'We accept major credit and debit cards at checkout. Additional methods may be available at launch — the checkout will always show the complete list for your region.',
  },
  {
    q: 'Can I modify or cancel an order after placing it?',
    a: 'We begin preparing orders quickly, so modifications are time-sensitive. Write to our team as soon as possible and we will do our best to accommodate.',
  },
];

const shippingFaq: FaqItem[] = [
  {
    q: 'Where do you ship?',
    a: 'We ship across India, with selected international destinations available at checkout. Shipping options and timing are calculated once you enter your address.',
  },
  {
    q: 'How long will my order take to arrive?',
    a: 'Ready-to-ship pieces are dispatched within a few business days. Made-to-order or altered pieces take longer — the product page will always indicate if extra lead time is required.',
  },
  {
    q: 'Do you offer express delivery?',
    a: 'Express options may be available at checkout depending on your address and the pieces in your cart. If you have a specific deadline, write to us and we will advise honestly.',
  },
];

const returnsFaq: FaqItem[] = [
  {
    q: 'What is your return policy?',
    a: 'Unworn pieces with tags intact can be returned within the window stated on the product page. Made-to-order, altered, and final-sale pieces are not eligible for return.',
  },
  {
    q: 'How do exchanges work?',
    a: 'If a size is not right, we will help you exchange it subject to availability. Message our team before returning — we will guide you through the process personally.',
  },
  {
    q: 'When will I see my refund?',
    a: 'Refunds are issued to the original payment method once the returned piece is received and inspected. The exact timing depends on your bank.',
  },
];

const sizingFaq: FaqItem[] = [
  {
    q: 'How do I find my size?',
    a: (
      <>
        Every product page includes a detailed size guide with body and
        garment measurements. If you are between sizes, we usually recommend
        sizing for the larger measurement — or you can message us for a
        personal recommendation.
      </>
    ),
  },
  {
    q: 'Do you offer alterations?',
    a: 'For certain pieces, yes. Availability, pricing, and turnaround are shown on the product page where alterations are offered.',
  },
  {
    q: 'Can I order a custom size?',
    a: 'Custom sizing is available on select styles. Look for the custom-size option on the product page, or write to us about a specific piece.',
  },
];

const careFaq: FaqItem[] = [
  {
    q: 'How should I care for my garment?',
    a: 'Care instructions are printed inside each garment and listed on the product page. For silks, handlooms, and embellished pieces, dry cleaning is almost always the safest choice.',
  },
  {
    q: 'Will the colours fade?',
    a: 'Our fabrics are chosen for longevity, but natural dyes and delicate fibres benefit from gentle care — avoid direct sunlight for long periods and store folded in a cool, dry place.',
  },
];

const tryOnFaq: FaqItem[] = [
  {
    q: 'What is Virtual Try-On?',
    a: 'Virtual Try-On lets you upload a photo of yourself and preview eligible pieces on you before ordering. It is a quick way to see how a silhouette or colour feels.',
  },
  {
    q: 'Is my photo stored?',
    a: 'Your photo is handled privately and deleted after the preview, in line with our privacy policy. We never use customer photos for marketing without explicit permission.',
  },
  {
    q: 'Why is Try-On unavailable on some products?',
    a: 'Try-On is enabled on eligible pieces only. Highly structured or heavily embellished garments may not render accurately, so we leave them out rather than show a misleading preview.',
  },
];

/**
 * Flat text-only version of the FAQ used for FAQPage JSON-LD.
 * Kept in sync by hand so the schema always ships plain-text
 * answers even when the on-page answers contain React nodes.
 */
const faqSchemaItems: Array<{ q: string; a: string }> = [
  { q: 'How do I place an order?', a: 'Add pieces to your cart and proceed to checkout. You can check out as a guest or create an account to track orders, save addresses, and keep a wishlist.' },
  { q: 'Which payment methods do you accept?', a: 'We accept major credit and debit cards at checkout. Additional methods may be available at launch — the checkout will always show the complete list for your region.' },
  { q: 'Can I modify or cancel an order after placing it?', a: 'We begin preparing orders quickly, so modifications are time-sensitive. Write to our team as soon as possible and we will do our best to accommodate.' },
  { q: 'Where do you ship?', a: 'We ship across India, with selected international destinations available at checkout. Shipping options and timing are calculated once you enter your address.' },
  { q: 'How long will my order take to arrive?', a: 'Ready-to-ship pieces are dispatched within a few business days. Made-to-order or altered pieces take longer — the product page will always indicate if extra lead time is required.' },
  { q: 'What is your return policy?', a: 'Unworn pieces with tags intact can be returned within the window stated on the product page. Made-to-order, altered, and final-sale pieces are not eligible for return.' },
  { q: 'How do I find my size?', a: 'Every product page includes a detailed size guide with body and garment measurements. If you are between sizes, we usually recommend sizing for the larger measurement, or you can message us for a personal recommendation.' },
  { q: 'How should I care for my garment?', a: 'Care instructions are printed inside each garment and listed on the product page. For silks, handlooms, and embellished pieces, dry cleaning is almost always the safest choice.' },
  { q: 'What is Virtual Try-On?', a: 'Virtual Try-On lets you upload a photo of yourself and preview eligible pieces on you before ordering. It is a quick way to see how a silhouette or colour feels.' },
  { q: 'Is my photo stored?', a: 'Your photo is handled privately and deleted after the preview, in line with our privacy policy. We never use customer photos for marketing without explicit permission.' },
];

const supportFaq: FaqItem[] = [
  {
    q: 'How do I contact the team?',
    a: (
      <>
        The quickest way is through our{' '}
        <Link
          href="/contact"
          className="underline underline-offset-4 hover:text-accent-ember"
        >
          contact page
        </Link>
        . You can also find our direct email and messaging channels listed
        there.
      </>
    ),
  },
  {
    q: 'Do you offer styling advice?',
    a: 'Yes — styling guidance is part of the Sakthi service, not a paid add-on. Message us about an occasion or a specific piece and we will help.',
  },
];

export default function FaqPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqSchemaItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <PageHero
        eyebrow="Help Center"
        title="Frequently asked questions."
        lede="Everything you need to know about ordering, shipping, returns, sizing, care, and virtual try-on. Can't find your answer? Our team is a message away."
      />

      <Section>
        <div className="flex flex-col gap-16 md:gap-20">
          <FaqGroup
            eyebrow="01"
            title="Orders & Payment"
            items={ordersFaq}
          />
          <FaqGroup
            eyebrow="02"
            title="Shipping & Delivery"
            items={shippingFaq}
          />
          <FaqGroup
            eyebrow="03"
            title="Returns & Exchanges"
            items={returnsFaq}
          />
          <FaqGroup
            eyebrow="04"
            title="Sizing & Fit"
            items={sizingFaq}
          />
          <FaqGroup
            eyebrow="05"
            title="Product Care"
            items={careFaq}
          />
          <FaqGroup
            eyebrow="06"
            title="Virtual Try-On"
            items={tryOnFaq}
          />
          <FaqGroup
            eyebrow="07"
            title="Contact & Support"
            items={supportFaq}
          />
        </div>
      </Section>

      <ContentCtaBlock
        eyebrow="Still have questions?"
        title="Our team would love to help."
        lede="Styling advice, sizing recommendations, or a custom request — we reply personally, not with templates."
        ctaLabel="Contact Us"
        ctaHref="/contact"
      />
    </>
  );
}
