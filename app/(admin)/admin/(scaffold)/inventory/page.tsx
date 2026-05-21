import { AdminScaffoldPage } from '@/components/admin/AdminScaffoldPage';
import { listAdminVariants } from '@/lib/repositories/admin-inventory';
import { InventoryClient } from './InventoryClient';

export default async function AdminInventoryPage() {
  const rows = await listAdminVariants();
  return (
    <AdminScaffoldPage
      eyebrow="Catalog"
      title="Inventory"
      description="Stock per variant. Click any number to edit it inline."
    >
      <InventoryClient initialRows={rows} />
    </AdminScaffoldPage>
  );
}
