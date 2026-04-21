import { AdminScaffoldPage } from '@/components/admin/AdminScaffoldPage';
import { AdminSectionCard } from '@/components/admin/AdminSectionCard';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { AdminTable, type AdminColumn } from '@/components/admin/AdminTable';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { amazonListings, dashboardMetrics, type AmazonRow } from '@/lib/admin/mock-data';

const cols: AdminColumn<AmazonRow>[] = [
  { key: 'name', header: 'Product', cell: (r) => <span className="font-medium text-text-primary">{r.name}</span> },
  { key: 'sku', header: 'SKU', hideOn: 'sm', cell: (r) => <span className="text-text-muted">{r.sku}</span> },
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
    cell: (r) => r.error ? <span className="text-caption text-accent-crimson">{r.error}</span> : <span className="text-text-muted">—</span>,
  },
];

export default function AdminAmazonPage() {
  return (
    <AdminScaffoldPage
      eyebrow="Channels"
      title="Amazon"
      description="Channel-aware listing status. The Sakthi storefront remains the primary brand experience — Amazon is a secondary channel."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminStatCard label="Listed" value={dashboardMetrics.amazonListed} />
        <AdminStatCard label="Errors" value={dashboardMetrics.amazonErrors} />
        <AdminStatCard label="Pending sync" value={3} />
      </div>

      <AdminSectionCard title="Listings" description="Per-product channel mapping">
        <AdminTable columns={cols} rows={amazonListings} rowKey={(r) => r.id} />
      </AdminSectionCard>
    </AdminScaffoldPage>
  );
}
