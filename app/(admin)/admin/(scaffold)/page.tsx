import Link from 'next/link';
import { ShoppingCart, Star, BellRing, AlertTriangle } from 'lucide-react';
import { AdminScaffoldPage } from '@/components/admin/AdminScaffoldPage';
import { AdminSectionCard } from '@/components/admin/AdminSectionCard';
import { AdminTable, type AdminColumn } from '@/components/admin/AdminTable';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { KpiCard } from '@/components/admin/dashboard/KpiCard';
import { RevenueChart } from '@/components/admin/dashboard/RevenueChart';
import { PendingActionsList } from '@/components/admin/dashboard/PendingActionsList';
import { QuickActions } from '@/components/admin/dashboard/QuickActions';
import {
  getDashboardStats,
  getRevenueLast30Days,
  getTopProducts,
  type TopProductRow,
} from '@/lib/repositories/admin-stats';
import { listRecentOrders } from '@/lib/repositories/orders';
import { listCustomers } from '@/lib/repositories/customers';
import type { AdminOrderRow } from '@/lib/admin/mock-data';

function usd(n: number) {
  return `$${n.toLocaleString('en-US')}`;
}

const orderCols: AdminColumn<AdminOrderRow>[] = [
  {
    key: 'id',
    header: 'Order',
    cell: (r) => (
      <Link
        href={`/admin/orders/${r.id}`}
        className="font-medium text-text-primary underline-offset-4 hover:underline"
      >
        {r.id}
      </Link>
    ),
  },
  { key: 'customer', header: 'Customer', cell: (r) => r.customer },
  {
    key: 'total',
    header: 'Total',
    align: 'right',
    cell: (r) => <span className="nums-tabular">{usd(r.total)}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    cell: (r) => <AdminStatusBadge status={r.status} />,
  },
];

const topCols: AdminColumn<TopProductRow>[] = [
  {
    key: 'name',
    header: 'Product',
    cell: (r) => <span className="font-medium text-text-primary">{r.name}</span>,
  },
  {
    key: 'units',
    header: 'Units',
    align: 'right',
    cell: (r) => (
      <span className="nums-tabular text-text-muted">
        {r.units > 0 ? r.units : '—'}
      </span>
    ),
  },
  {
    key: 'revenue',
    header: 'Revenue',
    align: 'right',
    cell: (r) => (
      <span className="nums-tabular text-text-muted">
        {r.revenue > 0 ? usd(r.revenue) : '—'}
      </span>
    ),
  },
];

function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-6 py-10 text-center">
      <p className="text-body text-text-secondary">{title}</p>
      {hint && <p className="text-caption text-text-muted">{hint}</p>}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [stats, revenue30d, topProducts, recentOrders, recentCustomers] =
    await Promise.all([
      getDashboardStats(),
      getRevenueLast30Days(),
      getTopProducts(5),
      listRecentOrders(5),
      listCustomers(5),
    ]);

  const pendingActions = [
    {
      icon: ShoppingCart,
      label: 'orders awaiting fulfillment',
      count: stats.pendingOrders,
      href: '/admin/orders?status=pending',
      cta: 'Pack & ship today',
    },
    {
      icon: Star,
      label: 'reviews to moderate',
      count: stats.reviewsPending,
      href: '/admin/reviews',
      cta: 'Approve or hide',
    },
    {
      icon: BellRing,
      label: 'customers waiting on alerts',
      count: 0,
      href: '/admin/alerts',
      cta: 'No subscriptions yet',
    },
    {
      icon: AlertTriangle,
      label: 'products below stock threshold',
      count: stats.lowStockCount,
      href: '/admin/inventory?filter=low',
      cta: 'Restock or hide',
    },
  ].filter((a) => a.count > 0);

  const revenue30dTotal = revenue30d.reduce((a, b) => a + b, 0);
  const hasRevenueSeries = revenue30dTotal > 0;
  const revenueSpark = hasRevenueSeries ? revenue30d.slice(-14) : undefined;

  return (
    <AdminScaffoldPage
      eyebrow="Overview"
      title="Dashboard"
      description="Today at a glance across storefront, fulfillment, and channels."
      actions={<QuickActions />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Revenue · Today"
          value={usd(stats.revenueToday)}
          delta={stats.revenueTodayDelta ?? undefined}
          helper={
            stats.revenueTodayDelta === null
              ? stats.hasAnyOrders
                ? 'no orders yesterday'
                : 'no orders yet'
              : 'vs. yesterday'
          }
          spark={revenueSpark}
        />
        <KpiCard
          label="Orders · Today"
          value={stats.ordersToday}
          delta={stats.ordersTodayDelta ?? undefined}
          helper={
            stats.ordersTodayDelta === null
              ? stats.hasAnyOrders
                ? 'no orders yesterday'
                : 'no orders yet'
              : 'vs. yesterday'
          }
        />
        <KpiCard
          label="Average Order Value"
          value={usd(stats.aov)}
          delta={stats.aovDelta ?? undefined}
          helper={stats.aov > 0 ? '7-day avg' : 'no orders in last 7 days'}
        />
        <KpiCard
          label="Low Stock"
          value={stats.lowStockCount}
          helper="below threshold"
          tone={stats.lowStockCount > 0 ? 'warning' : 'neutral'}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <AdminSectionCard
          title="Revenue · Last 30 days"
          description={
            hasRevenueSeries
              ? `Total ${usd(revenue30dTotal)}`
              : 'No revenue in the last 30 days'
          }
          action={{ label: 'Orders', href: '/admin/orders' }}
          className="xl:col-span-8"
          bodyClassName={hasRevenueSeries ? 'px-4 pt-4 pb-6' : 'p-0'}
        >
          {hasRevenueSeries ? (
            <RevenueChart points={revenue30d} />
          ) : (
            <EmptyState
              title="No orders yet."
              hint="Once orders start landing, the chart will populate here."
            />
          )}
        </AdminSectionCard>

        <AdminSectionCard
          title="Pending actions"
          description="What needs your attention right now"
          className="xl:col-span-4"
          bodyClassName="p-0"
        >
          <PendingActionsList items={pendingActions} />
        </AdminSectionCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <AdminSectionCard
          title="Recent Orders"
          description="Latest activity"
          action={{ label: 'View all', href: '/admin/orders' }}
          bodyClassName={recentOrders.length === 0 ? 'p-0' : undefined}
        >
          <AdminTable
            columns={orderCols}
            rows={recentOrders}
            rowKey={(r) => r.id}
            empty={<EmptyState title="No orders yet." />}
          />
        </AdminSectionCard>

        <AdminSectionCard
          title="Top Products"
          description={
            topProducts.some((p) => p.units > 0)
              ? 'Last 30 days'
              : 'Most recent active products'
          }
          action={{ label: 'Products', href: '/admin/products' }}
          bodyClassName={topProducts.length === 0 ? 'p-0' : undefined}
        >
          <AdminTable
            columns={topCols}
            rows={topProducts}
            rowKey={(r) => r.id}
            empty={
              <EmptyState
                title="No products yet."
                hint="Add products from the Products page to see them here."
              />
            }
          />
        </AdminSectionCard>

        <AdminSectionCard
          title="Latest Customers"
          description="New + returning shoppers"
          action={{ label: 'View all', href: '/admin/customers' }}
          bodyClassName="p-0"
        >
          {recentCustomers.length === 0 ? (
            <EmptyState
              title="No customers yet."
              hint="Customers appear here after their first sign-up or order."
            />
          ) : (
            <ul className="divide-y divide-border-hairline">
              {recentCustomers.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-6 py-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center border border-border-hairline bg-bg-subtle text-caption font-medium text-text-primary">
                    {c.name
                      .split(' ')
                      .map((p) => p[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-medium text-text-primary">
                      {c.name}
                    </p>
                    <p className="text-caption text-text-muted truncate">
                      {c.email}
                    </p>
                  </div>
                  <span className="text-caption text-text-muted nums-tabular">
                    {usd(c.lifetime)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminSectionCard>
      </div>
    </AdminScaffoldPage>
  );
}
