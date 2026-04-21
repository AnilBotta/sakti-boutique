import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Plus, Boxes, BellRing } from 'lucide-react';

interface Action {
  href: string;
  label: string;
  icon: LucideIcon;
  primary?: boolean;
}

const actions: Action[] = [
  { href: '/admin/products/new', label: 'New product', icon: Plus, primary: true },
  { href: '/admin/inventory', label: 'Adjust inventory', icon: Boxes },
  { href: '/admin/alerts', label: 'Pending alerts', icon: BellRing },
];

export function QuickActions() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <Link
            key={a.href}
            href={a.href}
            className={
              a.primary
                ? 'inline-flex h-10 items-center gap-2 bg-accent-ember px-4 text-caption font-medium uppercase tracking-[0.12em] text-bg-canvas transition-colors duration-fast ease-standard hover:bg-[#b04e16]'
                : 'inline-flex h-10 items-center gap-2 border border-border-default px-4 text-caption font-medium uppercase tracking-[0.12em] text-text-primary transition-colors duration-fast ease-standard hover:bg-bg-subtle'
            }
          >
            <Icon className="h-4 w-4" strokeWidth={1.5} />
            {a.label}
          </Link>
        );
      })}
    </div>
  );
}
