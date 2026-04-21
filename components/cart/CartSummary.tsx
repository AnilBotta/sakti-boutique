import { cn } from '@/lib/utils/cn';
import { formatUSD } from '@/lib/cart/totals';

interface CartSummaryProps {
  subtotal: number;
  className?: string;
}

export function CartSummary({ subtotal, className }: CartSummaryProps) {
  return (
    <dl className={cn('flex flex-col gap-3 text-body', className)}>
      <Row label="Subtotal" value={formatUSD(subtotal)} />
      <Row
        label="Shipping"
        value={<span className="text-text-muted">Calculated at checkout</span>}
        subtle
      />
      <Row
        label="Estimated taxes"
        value={<span className="text-text-muted">Calculated at checkout</span>}
        subtle
      />
      <div className="my-2 border-t border-border-hairline" />
      <Row
        label={<span className="font-medium text-text-primary">Total</span>}
        value={
          <span className="text-body-lg font-medium text-text-primary nums-tabular">
            {formatUSD(subtotal)}
          </span>
        }
      />
    </dl>
  );
}

function Row({
  label,
  value,
  subtle,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  subtle?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={cn('text-body', subtle ? 'text-text-secondary' : 'text-text-primary')}>
        {label}
      </dt>
      <dd className="nums-tabular text-body text-text-primary">{value}</dd>
    </div>
  );
}
