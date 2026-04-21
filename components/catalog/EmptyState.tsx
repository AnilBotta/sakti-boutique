import { Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  resetLabel?: string;
}

export function EmptyState({
  title = 'Nothing matches just yet',
  description = 'Try removing a filter or two — our atelier is always adding new pieces.',
  onReset,
  resetLabel = 'Clear filters',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-border-hairline bg-bg-subtle px-6 py-20 text-center">
      <Sparkles className="h-6 w-6 text-accent-ember" strokeWidth={1.5} />
      <p className="eyebrow mt-4 text-text-muted">No results</p>
      <h3 className="mt-2 text-h3 font-medium text-text-primary">{title}</h3>
      <p className="mt-2 max-w-sm text-body text-text-secondary">{description}</p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-6 inline-flex h-11 items-center rounded-md border border-text-primary px-6 text-button font-medium uppercase tracking-[0.02em] text-text-primary transition-colors duration-fast ease-standard hover:bg-text-primary hover:text-bg-canvas"
        >
          {resetLabel}
        </button>
      )}
    </div>
  );
}
