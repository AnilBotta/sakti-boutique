import { AdminScaffoldPage } from '@/components/admin/AdminScaffoldPage';
import { AdminSectionCard } from '@/components/admin/AdminSectionCard';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { AdminTable, type AdminColumn } from '@/components/admin/AdminTable';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import {
  listAmazonListings,
  getAmazonStats,
} from '@/lib/repositories/channel-mappings';
import type { AmazonRow } from '@/lib/admin/mock-data';

const cols: AdminColumn<AmazonRow>[] = [
  { key: 'name', header: 'Product', cell: (r) => <span className="font-medium text-text-primary">{r.name}</span> },
  { key: 'sku', header: 'SKU', hideOn: 'sm', cell: (r) => <span className="text-text-muted">{r.sku || '—'}</span> },
  { key: 'asin', header: 'ASIN', hideOn: 'md', cell: (r) => <span className="text-text-muted nums-tabular">{r.asin ?? '—'}</span> },
  { key: 'status', header: 'Status', cell: (r) => <AdminStatusBadge status={r.status} /> },
  {
    key: 'lastSync',
    header: 'Last sync',
    hideOn: 'md',
    cell: (r) => <span className="text-text-muted nums-tabular">{r.lastSync}</span>,
  },
  {
    key: 'error',
    header: 'Notes',
    cell: (r) =>
      r.error ? (
        <span className="text-caption text-accent-crimson">{r.error}</span>
      ) : (
        <span className="text-text-muted">—</span>
      ),
  },
];

export default async function AdminAmazonPage() {
  const [listings, stats] = await Promise.all([
    listAmazonListings(),
    getAmazonStats(),
  ]);
  return (
    <AdminScaffoldPage
      eyebrow="Channels"
      title="Amazon"
      description="Channel-aware listing status. The Sakthi storefront remains the primary brand experience — Amazon is a secondary channel."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminStatCard label="Listed" value={stats.listed} />
        <AdminStatCard label="Errors" value={stats.errors} />
        <AdminStatCard label="Pending sync" value={stats.pending} />
      </div>

      <AdminSectionCard title="Listings" description="Per-product channel mapping">
        {listings.length === 0 ? (
          <p className="px-6 py-12 text-center text-caption text-text-muted">
            No Amazon channel mappings yet. Enable Amazon on a product in the
            editor to create one.
          </p>
        ) : (
          <AdminTable columns={cols} rows={listings} rowKey={(r) => r.id} />
        )}
      </AdminSectionCard>
    </AdminScaffoldPage>
  );
}
