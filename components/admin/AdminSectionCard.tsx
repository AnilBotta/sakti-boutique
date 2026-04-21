import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface AdminSectionCardProps {
  title: string;
  description?: string;
  action?: { label: string; href: string };
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

export function AdminSectionCard({
  title,
  description,
  action,
  className,
  bodyClassName,
  children,
}: AdminSectionCardProps) {
  return (
    <section
      className={cn(
        'flex flex-col border border-border-hairline bg-bg-canvas',
        className,
      )}
    >
      <header className="flex items-start justify-between gap-4 border-b border-border-hairline px-6 py-5">
        <div>
          <h2 className="text-body-lg font-medium text-text-primary">{title}</h2>
          {description && (
            <p className="mt-1 text-caption text-text-muted">{description}</p>
          )}
        </div>
        {action && (
          <Link
            href={action.href}
            className="text-caption uppercase tracking-[0.12em] text-text-secondary underline underline-offset-4 transition-colors duration-fast ease-standard hover:text-text-primary"
          >
            {action.label}
          </Link>
        )}
      </header>
      <div className={cn('flex-1', bodyClassName)}>{children}</div>
    </section>
  );
}
