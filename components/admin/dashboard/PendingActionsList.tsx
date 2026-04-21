import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

export interface PendingAction {
  icon: LucideIcon;
  label: string;
  count: number;
  href: string;
  cta: string;
}

interface PendingActionsListProps {
  items: PendingAction[];
}

export function PendingActionsList({ items }: PendingActionsListProps) {
  if (items.length === 0) {
    return (
      <p className="px-6 py-8 text-caption text-text-muted">
        Nothing waiting on you. Inbox zero.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border-hairline">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <li key={it.label}>
            <Link
              href={it.href}
              className="group flex items-center gap-4 px-6 py-4 transition-colors duration-fast ease-standard hover:bg-bg-subtle"
            >
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center border border-border-hairline bg-bg-canvas text-text-secondary">
                <Icon className="h-4 w-4" strokeWidth={1.5} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-body font-medium text-text-primary">
                  <span className="nums-tabular">{it.count}</span>{' '}
                  <span className="text-text-secondary">{it.label}</span>
                </p>
                <p className="mt-0.5 text-caption text-text-muted">{it.cta}</p>
              </div>
              <ChevronRight
                className="h-4 w-4 flex-shrink-0 text-text-muted transition-transform duration-fast ease-standard group-hover:translate-x-0.5"
                strokeWidth={1.5}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
