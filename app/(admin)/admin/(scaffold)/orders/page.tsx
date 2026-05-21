import { AdminScaffoldPage } from '@/components/admin/AdminScaffoldPage';
import { listRecentOrders } from '@/lib/repositories/orders';
import { OrdersClient } from './OrdersClient';

export default async function AdminOrdersPage() {
  const orders = await listRecentOrders(100);
  return (
    <AdminScaffoldPage
      eyebrow="Commerce"
      title="Orders"
      description="Pack, ship, and track orders."
    >
      <OrdersClient initialOrders={orders} />
    </AdminScaffoldPage>
  );
}
