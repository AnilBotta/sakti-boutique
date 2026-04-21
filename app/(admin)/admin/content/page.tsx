import { AdminScaffoldPage } from '@/components/admin/AdminScaffoldPage';
import { AdminSectionCard } from '@/components/admin/AdminSectionCard';
import { AdminTable, type AdminColumn } from '@/components/admin/AdminTable';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { contentPages } from '@/lib/admin/mock-data';

type Row = (typeof contentPages)[number];

const cols: AdminColumn<Row>[] = [
  { key: 'title', header: 'Page', cell: (r) => <span className="font-medium text-text-primary">{r.title}</span> },
  { key: 'slug', header: 'Slug', hideOn: 'sm', cell: (r) => <span className="text-text-muted">/{r.slug}</span> },
  { key: 'status', header: 'Status', cell: (r) => <AdminStatusBadge status={r.status} /> },
  { key: 'updated', header: 'Updated', hideOn: 'md', cell: (r) => <span className="text-text-muted nums-tabular">{r.updated}</span> },
];

export default function AdminContentPage() {
  return (
    <AdminScaffoldPage
      eyebrow="Content"
      title="Content Pages"
      description="Manage About, FAQ, Contact, and editorial pages like lookbooks and stories."
    >
      <AdminSectionCard title="All Pages">
        <AdminTable columns={cols} rows={contentPages} rowKey={(r) => r.slug} />
      </AdminSectionCard>
    </AdminScaffoldPage>
  );
}
