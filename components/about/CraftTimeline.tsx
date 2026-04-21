import { Section, SectionHeading } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';

interface Step {
  eyebrow: string;
  title: string;
  body: string;
}

const steps: Step[] = [
  {
    eyebrow: '01',
    title: 'Source',
    body: 'Handlooms, silks, and cottons chosen bolt by bolt — for drape, breath, and how they age.',
  },
  {
    eyebrow: '02',
    title: 'Design',
    body: 'Small runs sketched around silhouettes women actually wear, not runway theatrics.',
  },
  {
    eyebrow: '03',
    title: 'Cut',
    body: 'Patterns graded on real bodies so fit is honest, consistent, and forgiving.',
  },
  {
    eyebrow: '04',
    title: 'Embroider',
    body: 'Zardozi, aari, block-print, and handloom — finished by artisans we credit by name.',
  },
  {
    eyebrow: '05',
    title: 'Finish',
    body: 'Hand-pressed, inspected, and packed with care before it leaves the atelier.',
  },
];

export function CraftTimeline() {
  return (
    <Section>
      <SectionHeading
        eyebrow="How a piece is made"
        title="Five steps, one standard."
        lede="Every garment moves through the same careful rhythm — no shortcuts, no outsourced quality."
      />
      <ol className="grid grid-cols-1 gap-10 md:grid-cols-5 md:gap-6">
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.06} as="li">
            <div className="flex flex-col gap-3 border-t border-border-hairline pt-6">
              <span className="eyebrow text-accent-ember">{s.eyebrow}</span>
              <h3 className="text-h3 font-medium text-text-primary">
                {s.title}
              </h3>
              <p className="text-body text-text-secondary">{s.body}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
