import { AdminScaffoldPage } from '@/components/admin/AdminScaffoldPage';
import { AdminSectionCard } from '@/components/admin/AdminSectionCard';
import { AdminTable, type AdminColumn } from '@/components/admin/AdminTable';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { listContentPages, type ContentPageRow } from '@/lib/repositories/content';

const cols: AdminColumn<ContentPageRow>[] = [
  { key: 'title', header: 'Page', cell: (r) => <span className="font-medium text-text-primary">{r.title}</span> },
  { key: 'slug', header: 'Slug', hideOn: 'sm', cell: (r) => <span className="text-text-muted">/{r.slug}</span> },
  { key: 'status', header: 'Status', cell: (r) => <AdminStatusBadge status={r.status} /> },
  { key: 'updated', header: 'Updated', hideOn: 'md', cell: (r) => <span className="text-text-muted nums-tabular">{r.updated}</span> },
];

export default async function AdminContentPage() {
  const rows = await listContentPages();
  return (
    <AdminScaffoldPage
      eyebrow="Content"
      title="Content Pages"
      description="Manage About, FAQ, Contact, and editorial pages like lookbooks and stories."
    >
      <AdminSectionCard title="All Pages">
        {rows.length === 0 ? (
          <p className="px-6 py-12 text-center text-caption text-text-muted">
            No content pages yet.
          </p>
        ) : (
          <AdminTable columns={cols} rows={rows} rowKey={(r) => r.slug} />
        )}
      </AdminSectionCard>
    </AdminScaffoldPage>
  );
}
