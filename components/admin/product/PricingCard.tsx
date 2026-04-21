'use client';

import { AdminFieldRow, AdminInput } from '@/components/admin/form';
import type { EditableProduct } from '@/lib/admin/product-editor';

interface PricingCardProps {
  product: EditableProduct;
  onChange: (patch: Partial<EditableProduct>) => void;
}

export function PricingCard({ product, onChange }: PricingCardProps) {
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100,
        )
      : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <AdminFieldRow label="Price" htmlFor="price" required>
          <AdminInput
            id="price"
            type="number"
            min={0}
            step="0.01"
            prefix="$"
            value={product.price}
            onChange={(e) => onChange({ price: Number(e.target.value) || 0 })}
          />
        </AdminFieldRow>
        <AdminFieldRow
          label="Compare-at price"
          htmlFor="originalPrice"
          helper={
            discount > 0
              ? `Displays as strikethrough. ${discount}% off.`
              : 'Optional. Shows as strikethrough when higher than price.'
          }
        >
          <AdminInput
            id="originalPrice"
            type="number"
            min={0}
            step="0.01"
            prefix="$"
            value={product.originalPrice ?? ''}
            onChange={(e) =>
              onChange({
                originalPrice:
                  e.target.value === '' ? null : Number(e.target.value) || 0,
              })
            }
            placeholder="—"
          />
        </AdminFieldRow>
      </div>
      <p className="text-caption text-text-muted">
        Variant-level pricing overrides these defaults in the Variants section.
      </p>
    </div>
  );
}
