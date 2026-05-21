import { AdminScaffoldPage } from '@/components/admin/AdminScaffoldPage';
import { AdminSectionCard } from '@/components/admin/AdminSectionCard';
import { AdminFilterBar } from '@/components/admin/AdminFilterBar';
import { AdminTable, type AdminColumn } from '@/components/admin/AdminTable';
import { listCustomers } from '@/lib/repositories/customers';
import type { CustomerRow } from '@/lib/admin/mock-data';

const cols: AdminColumn<CustomerRow>[] = [
  { key: 'name', header: 'Customer', cell: (r) => <span className="font-medium text-text-primary">{r.name}</span> },
  { key: 'email', header: 'Email', hideOn: 'sm', cell: (r) => <span className="text-text-muted">{r.email}</span> },
  { key: 'orders', header: 'Orders', align: 'right', cell: (r) => <span className="nums-tabular">{r.orders}</span> },
  { key: 'lifetime', header: 'Lifetime', align: 'right', cell: (r) => <span className="nums-tabular">${r.lifetime.toLocaleString()}</span> },
  { key: 'lastOrder', header: 'Last order', hideOn: 'md', cell: (r) => <span className="text-text-muted nums-tabular">{r.lastOrder}</span> },
];

export default async function AdminCustomersPage() {
  const customers = await listCustomers(100);
  return (
    <AdminScaffoldPage
      eyebrow="Commerce"
      title="Customers"
      description="View customer profiles, lifetime value, and order history."
    >
      <AdminSectionCard title="Customers" description={`${customers.length} recent`}>
        <AdminFilterBar searchPlaceholder="Search by name or email…" />
        <AdminTable columns={cols} rows={customers} rowKey={(r) => r.id} />
      </AdminSectionCard>
    </AdminScaffoldPage>
  );
}
