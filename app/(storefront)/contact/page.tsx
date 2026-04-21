import type { Metadata } from 'next';
import { PageHero } from '@/components/content/PageHero';
import { ContactMethodsCard } from '@/components/content/ContactMethodsCard';
import { ContactFormShell } from '@/components/content/ContactFormShell';
import { RichTextSection } from '@/components/content/RichTextSection';
import { ContentCtaBlock } from '@/components/content/ContentCtaBlock';
import { Section } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    "Reach the Sakthi Trends USA atelier. Ask a styling question, plan a custom piece, or get help with an order — our team replies personally.",
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact · Sakthi Trends USA',
    description:
      'Reach the Sakthi Trends USA atelier — styling, custom pieces, and order help.',
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={<>We&rsquo;d love to hear from you.</>}
        lede="Questions about a piece, a styling decision, a gift, or a custom request — the Sakthi atelier reads every note personally. Choose the channel that suits you."
      />

      <Section>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="flex flex-col gap-8 lg:col-span-5">
            <Reveal>
              <div>
                <p className="eyebrow text-accent-ember">Ways to reach us</p>
                <h2 className="mt-3 text-[1.75rem] font-medium leading-tight text-text-primary md:text-[2rem]">
                  A direct line to the atelier.
                </h2>
                <p className="mt-4 max-w-md text-body text-text-secondary">
                  Whichever channel you choose, your message lands with a
                  human on our team — not a ticketing queue.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <ContactMethodsCard />
            </Reveal>
            <Reveal delay={0.16}>
              <p className="text-caption text-text-muted">
                Contact details shown above are placeholder values for this
                preview build and will be replaced with live channels before
                launch.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={0.05}>
              <ContactFormShell />
            </Reveal>
          </div>
        </div>
      </Section>

      <RichTextSection
        eyebrow="In Person"
        title="Visit the boutique."
      >
        <p>
          Sakthi is, at heart, a hands-on experience — touching fabric, seeing
          how embroidery catches the light, being draped by someone who knows
          the piece. Boutique visits are available by appointment so we can
          give you our full attention.
        </p>
        <p>
          Message us through any of the channels above to arrange a visit, and
          we will confirm the address, timing, and any pieces you&rsquo;d like
          pulled in advance.
        </p>
      </RichTextSection>

      <ContentCtaBlock
        eyebrow="Looking for a quick answer?"
        title="Browse the help center."
        lede="Orders, shipping, returns, sizing, care, and virtual try-on — most questions are answered in a few sentences."
        ctaLabel="Read the FAQ"
        ctaHref="/faq"
      />
    </>
  );
}
