import type { LucideIcon } from 'lucide-react';
import { Mail, Phone, Clock, MessageCircle } from 'lucide-react';

export interface ContactMethod {
  icon: LucideIcon;
  eyebrow: string;
  label: string;
  value: string;
  helper?: string;
  href?: string;
  /**
   * When true, this value is explicitly a placeholder/demo value that
   * should be replaced before launch. Rendered as a subtle caption.
   */
  placeholder?: boolean;
}

interface ContactMethodsCardProps {
  methods?: ContactMethod[];
}

/**
 * Default placeholder contact methods. Every value here is intentionally
 * generic and marked `placeholder: true` — swap these in a later step once
 * real support operations are defined. Do NOT treat any of these as a
 * committed SLA, phone number, or hours-of-operation promise.
 */
export const defaultContactMethods: ContactMethod[] = [
  {
    icon: Mail,
    eyebrow: 'Email',
    label: 'Write to us',
    value: 'hello@sakthitrendsusa.example',
    helper: 'Our team reads every note personally.',
    href: 'mailto:hello@sakthitrendsusa.example',
    placeholder: true,
  },
  {
    icon: MessageCircle,
    eyebrow: 'WhatsApp',
    label: 'Message the atelier',
    value: '+00 00000 00000',
    helper: 'Styling questions, order help, custom requests.',
    placeholder: true,
  },
  {
    icon: Phone,
    eyebrow: 'Phone',
    label: 'Speak with us',
    value: '+00 00000 00000',
    helper: 'Available during boutique hours.',
    placeholder: true,
  },
  {
    icon: Clock,
    eyebrow: 'Hours',
    label: 'Boutique & support',
    value: 'By appointment',
    helper: 'Exact hours confirmed on booking.',
    placeholder: true,
  },
];

/**
 * Premium contact-method grid. Each tile is a hairline-bordered card with
 * an eyebrow, headline label, the value, and an optional helper line.
 * Placeholder values are visually distinguishable via a small caption so
 * operators know what to replace.
 */
export function ContactMethodsCard({
  methods = defaultContactMethods,
}: ContactMethodsCardProps) {
  return (
    <ul
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      role="list"
      aria-label="Ways to contact Sakthi Trends USA"
    >
      {methods.map((m) => {
        const Icon = m.icon;
        const body = (
          <>
            <div className="flex items-start justify-between gap-4">
              <p className="eyebrow text-accent-ember">{m.eyebrow}</p>
              <Icon
                className="h-5 w-5 flex-shrink-0 text-text-muted"
                strokeWidth={1.5}
                aria-hidden
              />
            </div>
            <p className="mt-3 text-body-lg font-medium text-text-primary">
              {m.label}
            </p>
            <p className="mt-1 text-body text-text-secondary">{m.value}</p>
            {m.helper && (
              <p className="mt-3 text-caption text-text-muted">{m.helper}</p>
            )}
            {m.placeholder && (
              <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-text-muted/80">
                Placeholder · replace before launch
              </p>
            )}
          </>
        );

        return (
          <li
            key={`${m.eyebrow}-${m.label}`}
            className="border border-border-hairline p-6 transition-colors duration-fast ease-standard hover:border-border"
          >
            {m.href ? (
              <a
                href={m.href}
                className="block outline-none focus-visible:text-accent-ember"
              >
                {body}
              </a>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ul>
  );
}
