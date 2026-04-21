import { Section, SectionHeading } from './Section';

interface PlaceholderPageProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

/**
 * Lightweight editorial scaffold used by routes whose full experience
 * is still being prepared. Keeps a consistent, calm voice across any
 * page that is not yet fully composed.
 */
export function PlaceholderPage({
  eyebrow = 'Sakthi Trends USA',
  title,
  description = 'The full experience for this page is being prepared. Thank you for your patience.',
}: PlaceholderPageProps) {
  return (
    <Section>
      <SectionHeading eyebrow={eyebrow} title={title} lede={description} />
    </Section>
  );
}
