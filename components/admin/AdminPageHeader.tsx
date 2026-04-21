import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface AdminPageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 pb-8 md:flex-row md:items-end md:justify-between md:gap-6 md:pb-10',
        className,
      )}
    >
      <div>
        {eyebrow && <p className="eyebrow text-accent-ember">{eyebrow}</p>}
        <h1 className="mt-2 text-[1.5rem] font-medium leading-tight text-text-primary md:text-[1.75rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-caption text-text-secondary">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
