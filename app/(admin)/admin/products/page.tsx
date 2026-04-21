'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Pencil,
  Archive,
  Trash2,
  CircleDashed,
  Store,
  Sparkles,
  PackageOpen,
} from 'lucide-react';
import { AdminScaffoldPage } from '@/components/admin/AdminScaffoldPage';
import { AdminSectionCard } from '@/components/admin/AdminSectionCard';
import {
  AdminTable,
  type AdminColumn,
} from '@/components/admin/AdminTable';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { AdminFilterBar } from '@/components/admin/AdminFilterBar';
import { taxonomy } from '@/lib/catalog/taxonomy';
import { resolveAdminNavItem } from '@/lib/admin/nav';
import { useAdminProducts } from '@/lib/admin/local-repo/products';
import type { EditableProduct } from '@/lib/admin/product-editor';

type StatusFilter = 'all' | 'active' | 'draft' | 'archived';
type AudienceFilter = 'all' | 'women' | 'men' | 'kids';

function categoryLabel(p: EditableProduct): string {
  const a = taxonomy[p.audience];
  const c = a.categories.find((cat) => cat.slug === p.category);
  if (!c) return a.label;
  const sub = c.subcategories.find((s) => s.slug === p.subcategory);
  return sub ? `${a.label} · ${c.label} · ${sub.label}` : `${a.label} · ${c.label}`;
}

function totalStock(p: EditableProduct): number {
  return p.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
}

function FlagPill({
  active,
  label,
  tone = 'info',
  children,
}: {
  active: boolean;
  label: string;
  tone?: 'info' | 'accent' | 'danger';
  children: React.ReactNode;
}) {
  if (!active) {
    return (
      <span
        title={`${label} (off)`}
        className="inline-flex h-6 items-center gap-1 border border-border-hairline px-2 text-[10px] font-medium uppercase tracking-[0.12em] text-text-muted"
      >
        <CircleDashed className="h-3 w-3" strokeWidth={1.5} />
      </span>
    );
  }
  const toneClass = {
    info: 'border-accent-plum/30 text-accent-plum',
    accent: 'border-accent-ember/40 text-accent-ember',
    danger: 'border-accent-crimson/40 text-accent-crimson',
  }[tone];
  return (
    <span
      title={label}
      className={`inline-flex h-6 items-center gap-1 border px-2 text-[10px] font-medium uppercase tracking-[0.12em] ${toneClass}`}
    >
      {children}
    </span>
  );
}

export default function AdminProductsPage() {
  const [products, mutators] = useAdminProducts();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [audienceFilter, setAudienceFilter] = useState<AudienceFilter>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (audienceFilter !== 'all' && p.audience !== audienceFilter) return false;
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !p.id.toLowerCase().includes(q) &&
        !p.variants.some((v) => v.sku.toLowerCase().includes(q))
      ) {
        return false;
      }
      return true;
    });
  }, [products, search, statusFilter, audienceFilter]);

  const counts = {
    all: products.length,
    active: products.filter((p) => p.status === 'active').length,
    draft: products.filter((p) => p.status === 'draft').length,
    archived: products.filter((p) => p.status === 'archived').length,
    lowStock: products.filter((p) => totalStock(p) > 0 && totalStock(p) < 5).length,
  };

  const meta = resolveAdminNavItem('/admin/products');

  const handleArchive = (id: string, name: string) => {
    if (!confirm(`Archive "${name}"? It can be restored later.`)) return;
    mutators.archive(id);
  };
  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Permanently delete "${name}"? This cannot be undone.`)) return;
    mutators.remove(id);
  };

  const cols: AdminColumn<EditableProduct>[] = [
    {
      key: 'name',
      header: 'Product',
      primary: true,
      cell: (r) => (
        <div className="flex min-w-0 flex-col">
          <Link
            href={`/admin/products/${r.id}`}
            className="truncate font-medium text-text-primary underline-offset-4 hover:underline"
          >
            {r.name || 'Untitled'}
          </Link>
          <span className="truncate text-[11px] uppercase tracking-[0.12em] text-text-muted">
            {r.id}
          </span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      hideOn: 'md',
      cell: (r) => (
        <span className="capitalize text-text-secondary">{categoryLabel(r)}</span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      align: 'right',
      cell: (r) => (
        <span className="nums-tabular text-text-primary">${r.price}</span>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      align: 'right',
      hideOn: 'md',
      cell: (r) => {
        const s = totalStock(r);
        return (
          <span
            className={`nums-tabular ${
              s === 0
                ? 'text-accent-crimson'
                : s < 5
                  ? 'text-accent-ember'
                  : 'text-text-primary'
            }`}
          >
            {s}
          </span>
        );
      },
    },
    {
      key: 'flags',
      header: 'Flags',
      hideOn: 'sm',
      cell: (r) => (
        <div className="flex items-center gap-2">
          <FlagPill
            active={r.channel.publishToAmazon}
            label={`Amazon: ${r.channel.listingStatus}`}
            tone={r.channel.listingStatus === 'error' ? 'danger' : 'info'}
          >
            <Store className="h-3 w-3" strokeWidth={1.5} />
          </FlagPill>
          <FlagPill
            active={r.flags.tryOnEnabled}
            label="Try-On enabled"
            tone="accent"
          >
            <Sparkles className="h-3 w-3" strokeWidth={1.5} />
          </FlagPill>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (r) => <AdminStatusBadge status={r.status} />,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      mobileHidden: true,
      cell: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/products/${r.id}`}
            aria-label="Edit"
            title="Edit"
            className="inline-flex h-8 w-8 items-center justify-center border border-border-hairline text-text-secondary transition-colors duration-fast ease-standard hover:bg-bg-subtle hover:text-text-primary"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
          <button
            type="button"
            onClick={() => handleArchive(r.id, r.name)}
            disabled={r.status === 'archived'}
            aria-label="Archive"
            title={r.status === 'archived' ? 'Already archived' : 'Archive'}
            className="inline-flex h-8 w-8 items-center justify-center border border-border-hairline text-text-secondary transition-colors duration-fast ease-standard hover:bg-bg-subtle hover:text-text-primary disabled:opacity-40"
          >
            <Archive className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(r.id, r.name)}
            aria-label="Delete"
            title="Delete"
            className="inline-flex h-8 w-8 items-center justify-center border border-border-hairline text-text-secondary transition-colors duration-fast ease-standard hover:bg-bg-subtle hover:text-accent-crimson"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminScaffoldPage
      eyebrow={meta?.eyebrow ?? 'Catalog'}
      title={meta?.label ?? 'Products'}
      description={
        meta?.description ??
        'Create, edit, and publish products across the Sakthi catalog.'
      }
      actions={
        <Link
          href="/admin/products/new"
          className="inline-flex h-10 items-center gap-2 bg-accent-ember px-4 text-caption font-medium uppercase tracking-[0.12em] text-bg-canvas transition-opacity duration-fast ease-standard hover:opacity-90"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          New product
        </Link>
      }
    >
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 border border-border-hairline bg-bg-canvas px-6 py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center border border-border-hairline text-text-secondary">
            <PackageOpen className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-h3 font-medium text-text-primary">
              No products yet
            </h2>
            <p className="mt-1 text-caption text-text-muted">
              Create your first product to start the catalog.
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="inline-flex h-10 items-center gap-2 bg-accent-ember px-4 text-caption font-medium uppercase tracking-[0.12em] text-bg-canvas"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Create your first product
          </Link>
        </div>
      ) : (
        <AdminSectionCard
          title="All Products"
          description={`${counts.all} items · ${counts.active} active · ${counts.draft} draft · ${counts.lowStock} low stock`}
        >
          <div className="flex flex-col gap-3 border-b border-border-hairline px-4 py-4">
            <AdminFilterBar
              searchPlaceholder="Search products by name, ID, or SKU…"
              value={search}
              onChange={setSearch}
            />
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  ['all', `All (${counts.all})`],
                  ['active', `Active (${counts.active})`],
                  ['draft', `Draft (${counts.draft})`],
                  ['archived', `Archived (${counts.archived})`],
                ] as Array<[StatusFilter, string]>
              ).map(([key, label]) => (
                <FilterChip
                  key={key}
                  label={label}
                  active={statusFilter === key}
                  onClick={() => setStatusFilter(key)}
                />
              ))}
              <span
                className="mx-1 h-4 w-px bg-border-hairline"
                aria-hidden
              />
              {(['all', 'women', 'men', 'kids'] as AudienceFilter[]).map(
                (key) => (
                  <FilterChip
                    key={key}
                    label={key === 'all' ? 'All audiences' : key[0].toUpperCase() + key.slice(1)}
                    active={audienceFilter === key}
                    onClick={() => setAudienceFilter(key)}
                  />
                ),
              )}
            </div>
          </div>
          {filtered.length === 0 ? (
            <p className="px-6 py-12 text-center text-caption text-text-muted">
              No products match these filters.
            </p>
          ) : (
            <AdminTable columns={cols} rows={filtered} rowKey={(r) => r.id} />
          )}
        </AdminSectionCard>
      )}
    </AdminScaffoldPage>
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
