import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Section, SectionHeading } from '@/components/layout/Section';

export function TryMeBlock() {
  return (
    <Section tone="subtle">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="Virtual Try-On"
            title="See it on you, before it ships."
            lede="Upload a photo and preview how this piece looks on you in seconds. Private, secure, and deleted after your session."
            className="mb-8"
          />
          <Link
            href="#tryon"
            className="inline-flex min-h-[52px] items-center gap-2 bg-text-primary px-7 text-caption font-medium uppercase tracking-[0.16em] text-bg-canvas transition-opacity duration-fast ease-standard hover:opacity-90"
          >
            <Sparkles className="h-4 w-4" strokeWidth={1.5} />
            Try Me
          </Link>
          <p className="mt-4 text-caption text-text-muted">
            Your photo is never shared and is removed after your session ends.
          </p>
        </div>
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-bg-canvas ring-1 ring-border-hairline">
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="eyebrow text-text-muted">Preview</p>
          </div>
        </div>
      </div>
    </Section>
  );
}
