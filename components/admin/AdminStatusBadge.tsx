import { cn } from '@/lib/utils/cn';

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'accent';

const toneClass: Record<Tone, string> = {
  neutral: 'border-border-hairline text-text-secondary bg-bg-canvas',
  info:    'border-border-hairline text-accent-plum bg-bg-canvas',
  success: 'border-border-hairline text-state-success bg-bg-canvas',
  warning: 'border-border-hairline text-accent-ember bg-bg-canvas',
  danger:  'border-border-hairline text-accent-crimson bg-bg-canvas',
  accent:  'border-border-hairline text-accent-plum bg-bg-canvas',
};

// Dot color overrides the otherwise hairline-bordered pill so color isn't
// the only status signal — the label text carries the meaning.
const dotClass: Record<Tone, string> = {
  neutral: 'bg-text-muted',
  info:    'bg-accent-plum',
  success: 'bg-state-success',
  warning: 'bg-accent-ember',
  danger:  'bg-accent-crimson',
  accent:  'bg-accent-magenta',
};

const statusMap: Record<string, { tone: Tone; label: string }> = {
  // Products
  draft:     { tone: 'neutral', label: 'Draft' },
  active:    { tone: 'success', label: 'Active' },
  archived:  { tone: 'neutral', label: 'Archived' },
  // Orders
  pending:   { tone: 'warning', label: 'Pending' },
  paid:      { tone: 'info',    label: 'Paid' },
  packed:    { tone: 'info',    label: 'Packed' },
  shipped:   { tone: 'info',    label: 'Shipped' },
  delivered: { tone: 'success', label: 'Delivered' },
  cancelled: { tone: 'neutral', label: 'Cancelled' },
  refunded:  { tone: 'danger',  label: 'Refunded' },
  // Amazon
  listed:    { tone: 'success', label: 'Listed' },
  error:     { tone: 'danger',  label: 'Error' },
  suppressed:{ tone: 'warning', label: 'Suppressed' },
  // Reviews
  approved:  { tone: 'success', label: 'Approved' },
  hidden:    { tone: 'neutral', label: 'Hidden' },
  // Try-On
  enabled:   { tone: 'success', label: 'Enabled' },
  disabled:  { tone: 'neutral', label: 'Disabled' },
  published: { tone: 'success', label: 'Published' },
};

interface AdminStatusBadgeProps {
  status: string;
  className?: string;
}

export function AdminStatusBadge({ status, className }: AdminStatusBadgeProps) {
  const entry = statusMap[status] ?? { tone: 'neutral' as Tone, label: status };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em]',
        toneClass[entry.tone],
        className,
      )}
    >
      <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', dotClass[entry.tone])} />
      {entry.label}
    </span>
  );
}
