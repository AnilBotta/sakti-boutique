import type { ReactNode } from 'react';

interface CheckoutSectionProps {
  step: number;
  title: string;
  description?: string;
  children: ReactNode;
}

export function CheckoutSection({
  step,
  title,
  description,
  children,
}: CheckoutSectionProps) {
  const num = step.toString().padStart(2, '0');
  return (
    <section className="border-t border-border-hairline pt-10 first:border-t-0 first:pt-0 md:pt-12">
      <header className="mb-6">
        <p className="eyebrow text-accent-ember">
          {num} · {title}
        </p>
        {description && (
          <p className="mt-2 text-caption text-text-secondary">{description}</p>
        )}
      </header>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}
