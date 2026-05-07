'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Download, AlertTriangle } from 'lucide-react';
import { AdminScaffoldPage } from '@/components/admin/AdminScaffoldPage';
import { AdminSectionCard } from '@/components/admin/AdminSectionCard';
import { AdminFilterBar } from '@/components/admin/AdminFilterBar';
import { KpiCard } from '@/components/admin/dashboard/KpiCard';
import {
  useAdminProducts,
  updateAdminProductLocal,
} from '@/lib/admin/local-repo/products';
import type { EditableProduct } from '@/lib/admin/product-editor';

const LOW_STOCK_THRESHOLD = 5;

interface VariantRow {
  productId: string;
  productName: string;
  variantUid: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
}

function flatten(products: EditableProduct[]): VariantRow[] {
  return products.flatMap((p) =>
    p.variants.map((v) => ({
      productId: p.id,
      productName: p.name || 'Untitled product',
      variantUid: v.uid,
      sku: v.sku,
      size: v.size,
      color: v.color,
      stock: v.stock,
    })),
  );
}

function adjustStock(
  products: EditableProduct[],
  variantUid: string,
  newStock: number,
) {
  const product = products.find((p) =>
    p.variants.some((v) => v.uid === variantUid),
  );
  if (!product) return;
  const next: EditableProduct = {
    ...product,
    variants: product.variants.map((v) =>
      v.uid === variantUid ? { ...v, stock: Math.max(0, newStock) } : v,
    ),
  };
  updateAdminProductLocal(product.id, next);
}

export default function AdminInventoryPage() {
  const [products] = useAdminProducts();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const rows = useMemo(() => flatten(products), [products]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === 'low' && (r.stock === 0 || r.stock >= LOW_STOCK_THRESHOLD)) {
        return false;
      }
      if (filter === 'out' && r.stock !== 0) return false;
      if (
        q &&
        !r.productName.toLowerCase().includes(q) &&
        !r.sku.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [rows, search, filter]);

  const stats = {
    total: rows.length,
    inStock: rows.filter((r) => r.stock > 0).length,
    lowStock: rows.filter((r) => r.stock > 0 && r.stock < LOW_STOCK_THRESHOLD)
      .length,
    outOfStock: rows.filter((r) => r.stock === 0).length,
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((r) => r.variantUid)));
  };
  const toggleOne = (uid: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  const bulkAdjust = (delta: number) => {
    selected.forEach((uid) => {
      const row = rows.find((r) => r.variantUid === uid);
      if (row) adjustStock(products, uid, row.stock + delta);
    });
    setSelected(new Set());
  };
  const bulkSetZero = () => {
    if (!confirm(`Set stock to 0 for ${selected.size} variants?`)) return;
    selected.forEach((uid) => adjustStock(products, uid, 0));
    setSelected(new Set());
  };

  const exportCsv = () => {
    const header = 'product,sku,size,color,stock\n';
    const body = filtered
      .map((r) =>
        [r.productName, r.sku, r.size, r.color, r.stock]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(','),
      )
      .join('\n');
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sakthi-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminScaffoldPage
      eyebrow="Catalog"
      title="Inventory"
      description="Stock per variant. Click any number to edit it inline."
      actions={
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex h-10 items-center gap-2 border border-border-default px-4 text-caption font-medium uppercase tracking-[0.12em] text-text-primary transition-colors duration-fast ease-standard hover:bg-bg-subtle"
        >
          <Download className="h-4 w-4" strokeWidth={1.5} />
          Export CSV
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total variants" value={stats.total} />
        <KpiCard label="In stock" value={stats.inStock} />
        <KpiCard
          label="Low stock"
          value={stats.lowStock}
          tone={stats.lowStock > 0 ? 'warning' : 'neutral'}
          helper={`< ${LOW_STOCK_THRESHOLD} units`}
        />
        <KpiCard
          label="Out of stock"
          value={stats.outOfStock}
          tone={stats.outOfStock > 0 ? 'warning' : 'neutral'}
        />
      </div>

      <AdminSectionCard
        title="Variants"
        description={`${filtered.length} of ${rows.length} variants`}
      >
        <div className="flex flex-col gap-3 border-b border-border-hairline px-4 py-4">
          <AdminFilterBar
            searchPlaceholder="Search by product or SKU…"
            value={search}
            onChange={setSearch}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  ['all', `All (${rows.length})`],
                  ['low', `Low (${stats.lowStock})`],
                  ['out', `Out (${stats.outOfStock})`],
                ] as const
              ).map(([k, label]) => (
                <FilterChip
                  key={k}
                  label={label}
                  active={filter === k}
                  onClick={() => setFilter(k)}
                />
              ))}
            </div>
            {selected.size > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-caption text-text-secondary">
                <span>{selected.size} selected</span>
                <button
                  type="button"
                  onClick={() => bulkAdjust(10)}
                  className="h-8 border border-border-default px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-text-primary hover:bg-bg-subtle"
                >
                  +10 each
                </button>
                <button
                  type="button"
                  onClick={() => bulkAdjust(-10)}
                  className="h-8 border border-border-default px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-text-primary hover:bg-bg-subtle"
                >
                  −10 each
                </button>
                <button
                  type="button"
                  onClick={bulkSetZero}
                  className="h-8 border border-accent-crimson/40 px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-accent-crimson hover:bg-bg-subtle"
                >
                  Set to 0
                </button>
              </div>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="px-6 py-12 text-center text-caption text-text-muted">
            No variants match the current filter.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-caption">
              <thead className="border-b border-border-hairline bg-bg-subtle">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label="Select all"
                      checked={
                        selected.size === filtered.length &&
                        filtered.length > 0
                      }
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-medium uppercase tracking-[0.12em] text-text-muted">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left font-medium uppercase tracking-[0.12em] text-text-muted">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left font-medium uppercase tracking-[0.12em] text-text-muted">
                    Variant
                  </th>
                  <th className="px-4 py-3 text-right font-medium uppercase tracking-[0.12em] text-text-muted">
                    Stock
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-hairline">
                {filtered.map((r) => (
                  <tr key={r.variantUid} className="hover:bg-bg-subtle">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        aria-label={`Select ${r.sku}`}
                        checked={selected.has(r.variantUid)}
                        onChange={() => toggleOne(r.variantUid)}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Link
                        href={`/admin/products/${r.productId}`}
                        className="font-medium text-text-primary underline-offset-4 hover:underline"
                      >
                        {r.productName}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-text-muted">{r.sku}</td>
                    <td className="px-4 py-2 text-text-secondary">
                      {[r.size, r.color].filter(Boolean).join(' · ') || '—'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <InlineStockEditor
                        value={r.stock}
                        onSave={(n) =>
                          adjustStock(products, r.variantUid, n)
                        }
                      />
                      {r.stock > 0 && r.stock < LOW_STOCK_THRESHOLD && (
                        <span
                          title="Low stock"
                          className="ml-2 inline-flex items-center text-accent-ember"
                        >
                          <AlertTriangle
                            className="h-3.5 w-3.5"
                            strokeWidth={1.5}
                          />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminSectionCard>
    </AdminScaffoldPage>
  );
}

function InlineStockEditor({
  value,
  onSave,
}: {
  value: number;
  onSave: (n: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        className={`inline-flex h-8 min-w-[3rem] items-center justify-end px-2 nums-tabular tabular-nums hover:bg-bg-muted ${
          value === 0
            ? 'text-accent-crimson'
            : 'text-text-primary'
        }`}
      >
        {value}
      </button>
    );
  }

  const commit = () => {
    onSave(draft);
    setEditing(false);
  };

  return (
    <input
      type="number"
      min={0}
      autoFocus
      value={draft}
      onChange={(e) => setDraft(Number(e.target.value) || 0)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') setEditing(false);
      }}
      className="h-8 w-20 border border-accent-ember bg-bg-canvas px-2 text-right text-caption nums-tabular focus:outline-none"
    />
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-8 items-center border px-3 text-[11px] font-medium uppercase tracking-[0.12em] transition-colors duration-fast ease-standard ${
        active
          ? 'border-accent-ember bg-bg-muted text-accent-ember'
          : 'border-border-hairline text-text-secondary hover:bg-bg-subtle'
      }`}
    >
      {label}
    </button>
  );
}
