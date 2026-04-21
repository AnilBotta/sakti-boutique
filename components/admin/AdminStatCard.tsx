import type { ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AdminStatCardProps {
  label: string;
  value: ReactNode;
  delta?: number;
  helper?: string;
  className?: string;
}

export function AdminStatCard({
  label,
  value,
  delta,
  helper,
  className,
}: AdminStatCardProps) {
  const hasDelta = typeof delta === 'number';
  const positive = (delta ?? 0) >= 0;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border border-border-hairline bg-bg-canvas p-6',
        className,
      )}
    >
      <p className="eyebrow text-text-secondary">{label}</p>
      <p className="text-[1.75rem] font-medium leading-none text-text-primary nums-tabular">
        {value}
      </p>
      <div className="flex items-center gap-2 text-caption">
        {hasDelta && (
          <span
            className={cn(
              'inline-flex items-center gap-1 nums-tabular',
              positive ? 'text-state-success' : 'text-accent-crimson',
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            )}
            {Math.abs(delta * 100).toFixed(1)}%
          </span>
        )}
        {helper && <span className="text-text-muted">{helper}</span>}
      </div>
    </div>
  );
}
