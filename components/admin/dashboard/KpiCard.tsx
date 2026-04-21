import type { ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { RevenueSparkline } from './RevenueSparkline';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  delta?: number;
  helper?: string;
  spark?: number[];
  tone?: 'neutral' | 'warning';
  className?: string;
}

export function KpiCard({
  label,
  value,
  delta,
  helper,
  spark,
  tone = 'neutral',
  className,
}: KpiCardProps) {
  const hasDelta = typeof delta === 'number';
  const positive = (delta ?? 0) >= 0;

  return (
    <div
      className={cn(
        'relative flex flex-col gap-3 overflow-hidden border border-border-hairline bg-bg-canvas p-6',
        tone === 'warning' && 'border-accent-crimson/40',
        className,
      )}
    >
      {spark && spark.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 opacity-60">
          <RevenueSparkline points={spark} height={64} />
        </div>
      )}
      <div className="relative flex flex-col gap-3">
        <p className="eyebrow text-text-secondary">{label}</p>
        <p
          className={cn(
            'text-[1.875rem] font-medium leading-none nums-tabular',
            tone === 'warning' ? 'text-accent-crimson' : 'text-text-primary',
          )}
        >
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
              {Math.abs(delta * 100).toFixed(0)}%
            </span>
          )}
          {helper && <span className="text-text-muted">{helper}</span>}
        </div>
      </div>
    </div>
  );
}
