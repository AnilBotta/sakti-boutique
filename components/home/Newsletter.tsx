import { Section } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';

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
          <form
            className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
            // Real submission wired in a later step
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="your@email.com"
              className="h-12 flex-1 rounded-md border border-border bg-bg-canvas px-4 text-body text-text-primary placeholder:text-text-muted transition-colors duration-fast ease-standard focus:border-accent-ember focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-ember focus-visible:ring-offset-2"
            />
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-md bg-accent-ember px-7 text-button font-medium uppercase tracking-[0.02em] text-bg-canvas transition-all duration-fast ease-standard hover:bg-[#b04e16] active:scale-[0.985] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-ember focus-visible:ring-offset-2"
            >
              Subscribe
            </button>
          </form>
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
