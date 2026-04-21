'use client';

import { Plus, Trash2 } from 'lucide-react';
import { AdminInput } from '@/components/admin/form';
import {
  makeEmptyVariant,
  type EditableVariant,
} from '@/lib/admin/product-editor';
import { cn } from '@/lib/utils/cn';

interface VariantMatrixProps {
  variants: EditableVariant[];
  onChange: (next: EditableVariant[]) => void;
}

/**
 * Dense variant editor. Size/Color/SKU/Stock/Price/Sale per row.
 *
 * - ≥ lg: full table layout with hairline rows
 * - < lg: stacked card-per-variant layout so phones/tablets stay usable
 *
 * No persistence — state lives in the parent editor's reducer.
 */
export function VariantMatrix({ variants, onChange }: VariantMatrixProps) {
  const update = (uid: string, patch: Partial<EditableVariant>) => {
    onChange(variants.map((v) => (v.uid === uid ? { ...v, ...patch } : v)));
  };
  const remove = (uid: string) => {
    onChange(variants.filter((v) => v.uid !== uid));
  };
  const add = () => {
    onChange([...variants, makeEmptyVariant()]);
  };

  const totalStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Summary strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border border-border-hairline bg-bg-subtle px-4 py-3">
        <div className="flex items-center gap-4 text-caption text-text-secondary">
          <span>
            <span className="font-medium text-text-primary nums-tabular">
              {variants.length}
            </span>{' '}
            variant{variants.length === 1 ? '' : 's'}
          </span>
          <span className="h-3 w-px bg-border-default" aria-hidden />
          <span>
            <span className="font-medium text-text-primary nums-tabular">
              {totalStock}
            </span>{' '}
            total stock
          </span>
        </div>
        <button
          type="button"
          onClick={add}
          className="inline-flex h-9 items-center gap-2 border border-border-default px-3 text-caption font-medium uppercase tracking-[0.12em] text-text-primary transition-colors duration-fast ease-standard hover:bg-bg-canvas"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Add variant
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="border border-dashed border-border-default px-6 py-10 text-center">
          <p className="text-body text-text-secondary">No variants yet.</p>
          <p className="mt-1 text-caption text-text-muted">
            Add at least one variant to describe size / color combinations.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto border border-border-hairline">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border-hairline bg-bg-subtle">
                  {['Size', 'Color', 'SKU', 'Stock', 'Price', 'Sale', ''].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="h-10 px-3 text-left text-[11px] font-medium uppercase tracking-[0.12em] text-text-secondary"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => (
                  <tr
                    key={v.uid}
                    className="border-b border-border-hairline last:border-b-0"
                  >
                    <td className="p-2 align-middle">
                      <AdminInput
                        value={v.size}
                        onChange={(e) => update(v.uid, { size: e.target.value })}
                        placeholder="M"
                        aria-label="Size"
                      />
                    </td>
                    <td className="p-2 align-middle">
                      <AdminInput
                        value={v.color}
                        onChange={(e) => update(v.uid, { color: e.target.value })}
                        placeholder="Ivory"
                        aria-label="Color"
                      />
                    </td>
                    <td className="p-2 align-middle">
                      <AdminInput
                        value={v.sku}
                        onChange={(e) => update(v.uid, { sku: e.target.value })}
                        placeholder="SKU-0001"
                        aria-label="SKU"
                      />
                    </td>
                    <td className="p-2 align-middle w-[110px]">
                      <AdminInput
                        type="number"
                        min={0}
                        value={v.stock}
                        onChange={(e) =>
                          update(v.uid, { stock: Number(e.target.value) || 0 })
                        }
                        aria-label="Stock"
                      />
                    </td>
                    <td className="p-2 align-middle w-[130px]">
                      <AdminInput
                        type="number"
                        min={0}
                        step="0.01"
                        prefix="$"
                        value={v.price}
                        onChange={(e) =>
                          update(v.uid, { price: Number(e.target.value) || 0 })
                        }
                        aria-label="Price"
                      />
                    </td>
                    <td className="p-2 align-middle w-[130px]">
                      <AdminInput
                        type="number"
                        min={0}
                        step="0.01"
                        prefix="$"
                        value={v.salePrice ?? ''}
                        onChange={(e) =>
                          update(v.uid, {
                            salePrice:
                              e.target.value === ''
                                ? null
                                : Number(e.target.value) || 0,
                          })
                        }
                        aria-label="Sale price"
                        placeholder="—"
                      />
                    </td>
                    <td className="p-2 align-middle w-[52px] text-right">
                      <button
                        type="button"
                        onClick={() => remove(v.uid)}
                        aria-label={`Remove variant ${v.size || ''} ${v.color || ''}`.trim()}
                        className="inline-flex h-9 w-9 items-center justify-center text-text-muted transition-colors duration-fast ease-standard hover:text-accent-crimson"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / tablet stacked cards */}
          <ul className="lg:hidden flex flex-col gap-3" role="list">
            {variants.map((v, i) => (
              <li
                key={v.uid}
                className="border border-border-hairline bg-bg-canvas p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">
                    Variant {String(i + 1).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(v.uid)}
                    aria-label="Remove variant"
                    className="inline-flex h-8 w-8 items-center justify-center text-text-muted hover:text-accent-crimson"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <VFieldCell label="Size">
                    <AdminInput
                      value={v.size}
                      onChange={(e) => update(v.uid, { size: e.target.value })}
                      aria-label="Size"
                    />
                  </VFieldCell>
                  <VFieldCell label="Color">
                    <AdminInput
                      value={v.color}
                      onChange={(e) => update(v.uid, { color: e.target.value })}
                      aria-label="Color"
                    />
                  </VFieldCell>
                  <VFieldCell label="SKU" span={2}>
                    <AdminInput
                      value={v.sku}
                      onChange={(e) => update(v.uid, { sku: e.target.value })}
                      aria-label="SKU"
                    />
                  </VFieldCell>
                  <VFieldCell label="Stock">
                    <AdminInput
                      type="number"
                      min={0}
                      value={v.stock}
                      onChange={(e) =>
                        update(v.uid, { stock: Number(e.target.value) || 0 })
                      }
                      aria-label="Stock"
                    />
                  </VFieldCell>
                  <VFieldCell label="Price">
                    <AdminInput
                      type="number"
                      min={0}
                      step="0.01"
                      prefix="$"
                      value={v.price}
                      onChange={(e) =>
                        update(v.uid, { price: Number(e.target.value) || 0 })
                      }
                      aria-label="Price"
                    />
                  </VFieldCell>
                  <VFieldCell label="Sale">
                    <AdminInput
                      type="number"
                      min={0}
                      step="0.01"
                      prefix="$"
                      value={v.salePrice ?? ''}
                      onChange={(e) =>
                        update(v.uid, {
                          salePrice:
                            e.target.value === ''
                              ? null
                              : Number(e.target.value) || 0,
                        })
                      }
                      aria-label="Sale price"
                    />
                  </VFieldCell>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function VFieldCell({
  label,
  span = 1,
  children,
}: {
  label: string;
  span?: 1 | 2;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('flex flex-col gap-1', span === 2 && 'col-span-2')}>
      <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-text-muted">
        {label}
      </span>
      {children}
    </div>
  );
}
