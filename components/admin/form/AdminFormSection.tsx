import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface AdminFormSectionProps {
  /** Numeric step indicator, e.g. "01". */
  step?: string;
  /** Eyebrow label (uppercase, accent). */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Right-side header slot (e.g. inline action, help link). */
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

/**
 * Premium admin form section.
 *
 * Two-column desktop layout: a sticky left rail with step/eyebrow/title/description
 * and a right-side body that holds the actual fields. Collapses to a stacked
 * layout on narrow screens. Hairline-bordered card, restrained type.
 *
 * Use inside the product editor and any future admin form workflow.
 */
export function AdminFormSection({
  step,
  eyebrow,
  title,
  description,
  action,
  className,
  bodyClassName,
  children,
}: AdminFormSectionProps) {
  return (
    <section
      className={cn(
        'border border-border-hairline bg-bg-canvas',
        className,
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <header className="flex flex-col gap-3 border-b border-border-hairline px-6 py-6 lg:col-span-4 lg:border-b-0 lg:border-r lg:px-8 lg:py-8">
          {(step || eyebrow) && (
            <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.14em] text-accent-ember">
              {step && <span className="nums-tabular">{step}</span>}
              {step && eyebrow && (
                <span className="h-px w-6 bg-border-default" aria-hidden />
              )}
              {eyebrow && <span>{eyebrow}</span>}
            </div>
          )}
          <h2 className="text-body-lg font-medium leading-snug text-text-primary">
            {title}
          </h2>
          {description && (
            <p className="text-caption leading-relaxed text-text-secondary">
              {description}
            </p>
          )}
          {action && <div className="mt-1">{action}</div>}
        </header>
        <div
          className={cn(
            'flex flex-col gap-5 px-6 py-6 lg:col-span-8 lg:px-8 lg:py-8',
            bodyClassName,
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
