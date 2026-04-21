'use client';

import type { EditableProduct } from '@/lib/admin/product-editor';

interface InventoryCardProps {
  product: EditableProduct;
}

/**
 * Inventory is derived from variants — the editor treats variants as the
 * source of truth for stock. This card summarises the current state and
 * links operators to the Variants section for actual edits.
 */
export function InventoryCard({ product }: InventoryCardProps) {
  const totalStock = product.variants.reduce(
    (sum, v) => sum + (Number(v.stock) || 0),
    0,
  );
  const inStockVariants = product.variants.filter((v) => Number(v.stock) > 0).length;
  const outOfStockVariants = product.variants.length - inStockVariants;
  const lowStock = totalStock > 0 && totalStock < 10;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-4">
        <Stat label="Total units" value={totalStock} />
        <Stat label="In stock" value={inStockVariants} suffix="variants" />
        <Stat
          label="Out of stock"
          value={outOfStockVariants}
          suffix="variants"
          tone={outOfStockVariants > 0 ? 'danger' : 'neutral'}
        />
      </div>

      {lowStock && (
        <p className="border-l-2 border-accent-ember bg-bg-subtle px-4 py-3 text-caption text-text-secondary">
          Low stock. Consider replenishing before this product falls below
          display thresholds on category pages.
        </p>
      )}

      <p className="text-caption text-text-muted">
        Stock is managed per variant. Use the Variants section to adjust
        individual size / color availability.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
  tone = 'neutral',
}: {
  label: string;
  value: number;
  suffix?: string;
  tone?: 'neutral' | 'danger';
}) {
  return (
    <div className="border border-border-hairline bg-bg-subtle px-4 py-3">
      <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span
          className={`text-[1.5rem] font-medium leading-none nums-tabular ${
            tone === 'danger' ? 'text-accent-crimson' : 'text-text-primary'
          }`}
        >
          {value}
        </span>
        {suffix && (
          <span className="text-caption text-text-muted">{suffix}</span>
        )}
      </div>
    </div>
  );
}
