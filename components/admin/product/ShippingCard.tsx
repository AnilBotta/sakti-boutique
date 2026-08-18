'use client';

import { Package } from 'lucide-react';
import { AdminFieldRow, AdminInput } from '@/components/admin/form';
import type { EditableProduct, EditableShipping } from '@/lib/admin/product-editor';

interface ShippingCardProps {
  product: EditableProduct;
  onChange: (patch: Partial<EditableProduct>) => void;
}

/** Parse an input string to a non-negative number, or null when blank/invalid. */
function parseMeasure(raw: string): number | null {
  if (raw.trim() === '') return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function toInput(v: number | null): string {
  return v == null ? '' : String(v);
}

/**
 * Per-product shipping weight and package dimensions.
 *
 * USPS prices a parcel from its weight and box size. Enter this product's
 * shipping weight (ounces) and the box it ships in (inches). At checkout the
 * rating service sums the weights of everything in the cart into one package
 * and asks USPS for live rates. Leave fields blank to fall back to the
 * default box configured in Settings → Integrations → USPS.
 */
export function ShippingCard({ product, onChange }: ShippingCardProps) {
  const ship = product.shipping;

  function patchShipping(patch: Partial<EditableShipping>) {
    onChange({ shipping: { ...ship, ...patch } });
  }

  const hasWeight = ship.weightOz != null && ship.weightOz > 0;

  return (
    <div className="flex flex-col gap-5">
      <AdminFieldRow
        label="Shipping weight (oz)"
        htmlFor="shipping-weight-oz"
        helper="The packed weight of this item in ounces. Blank uses the default box weight from the Integrations panel."
      >
        <AdminInput
          id="shipping-weight-oz"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.1"
          value={toInput(ship.weightOz)}
          onChange={(e) => patchShipping({ weightOz: parseMeasure(e.target.value) })}
          placeholder="e.g. 12"
        />
      </AdminFieldRow>

      <div>
        <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-text-muted">
          Package dimensions (inches) — optional
        </div>
        <div className="grid grid-cols-3 gap-4">
          {(['length', 'width', 'height'] as const).map((dim) => (
            <label key={dim} className="flex flex-col gap-1.5">
              <span className="text-caption capitalize text-text-secondary">{dim}</span>
              <AdminInput
                id={`shipping-${dim}`}
                type="number"
                inputMode="decimal"
                min={0}
                step="0.1"
                value={toInput(ship[dim])}
                onChange={(e) => patchShipping({ [dim]: parseMeasure(e.target.value) } as Partial<EditableShipping>)}
                placeholder="in"
              />
            </label>
          ))}
        </div>
        <p className="mt-2 text-caption text-text-muted">
          Dimensions mostly affect price for large or bulky parcels. Soft goods
          are usually weight-driven — leaving these blank uses the default box.
        </p>
      </div>

      <div className="flex items-start gap-3 border border-border-hairline bg-bg-subtle p-4">
        <Package className="mt-0.5 h-4 w-4 flex-shrink-0 text-text-muted" strokeWidth={1.5} />
        <p className="text-caption text-text-secondary">
          {hasWeight
            ? 'This product will be priced by USPS using the weight above (and dimensions, if set).'
            : 'No weight set — checkout will fall back to the default package from the Integrations panel for this item.'}
        </p>
      </div>
    </div>
  );
}
