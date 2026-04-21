import type { ReactNode } from 'react';
import { Plus } from 'lucide-react';

export interface FaqItem {
  q: string;
  a: ReactNode;
}

interface FaqGroupProps {
  eyebrow?: string;
  title: string;
  description?: string;
  items: FaqItem[];
}

/**
 * Premium FAQ group. Uses the native `<details>` element for robust,
 * dependency-free disclosure — keyboard-accessible out of the box, works
 * without JS, and degrades gracefully when reduced-motion is enabled.
 *
 * The `group` marker and `open:` variant drive the rotating plus icon and
 * the opened border state.
 */
export function FaqGroup({
  eyebrow,
  title,
  description,
  items,
}: FaqGroupProps) {
  return (
    <section className="flex flex-col gap-6 md:gap-8">
      <header className="flex flex-col gap-2">
        {eyebrow && (
          <p className="eyebrow text-accent-ember">{eyebrow}</p>
        )}
        <h2 className="text-[1.5rem] font-medium leading-snug text-text-primary md:text-[1.875rem]">
          {title}
        </h2>
        {description && (
          <p className="max-w-2xl text-body text-text-secondary">
            {description}
          </p>
        )}
      </header>

      <ul className="border-t border-border-hairline" role="list">
        {items.map((item, i) => (
          <li
            key={`${title}-${i}`}
            className="border-b border-border-hairline"
          >
            <details className="group">
              <summary
                className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 md:py-6 text-left outline-none transition-colors duration-fast ease-standard hover:text-accent-ember focus-visible:text-accent-ember"
              >
                <span className="text-body-lg font-medium text-text-primary group-hover:text-accent-ember group-open:text-accent-ember">
                  {item.q}
                </span>
                <span
                  aria-hidden
                  className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center text-text-muted transition-transform duration-base ease-standard group-open:rotate-45 group-open:text-accent-ember"
                >
                  <Plus className="h-5 w-5" strokeWidth={1.5} />
                </span>
              </summary>
              <div className="pb-6 pr-10 text-body leading-relaxed text-text-secondary">
                {item.a}
              </div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
