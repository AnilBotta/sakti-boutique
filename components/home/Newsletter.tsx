import { Section } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { NewsletterForm } from './NewsletterForm';

export function Newsletter() {
  return (
    <Section tone="subtle">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <p className="eyebrow text-accent-ember">Stay In The Loop</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="mt-3 text-h1 font-medium leading-[1.1] text-text-primary md:text-[2.5rem]">
            Letters from the atelier
          </h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-4 text-body text-text-secondary">
            New collections, festive looks, and styling notes — once a month,
            never more.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <NewsletterForm source="homepage" />
        </Reveal>
        <Reveal delay={0.32}>
          <p className="mt-4 text-caption text-text-muted">
            By subscribing you agree to our privacy policy. Unsubscribe anytime.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
