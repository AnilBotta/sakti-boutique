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
  dashboardMetrics,
  recentOrders,
  topProducts,
  recentCustomers,
  type AdminOrderRow,
  type TopProductRow,
} from '@/lib/admin/mock-data';

function usd(n: number) {
  return `$${n.toLocaleString('en-US')}`;
}

// Last 30 days of revenue — shaped synthetic data so the chart reads as a story.
const revenue30d = [
  3120, 2980, 3420, 3680, 3210, 2840, 3950, 4120, 3760, 3490,
  3880, 4210, 4480, 4150, 3920, 4310, 4670, 4890, 4540, 4280,
  4470, 4710, 4920, 4820, 5040, 4880, 4730, 5120, 5060, 4820,
];

// Sparklines for KPI cards
const revenueSpark = revenue30d.slice(-14);
const ordersSpark = [22, 18, 24, 28, 25, 21, 27, 31, 29, 26, 32, 30, 28, 31];
const aovSpark = [142, 148, 151, 154, 159, 156, 162, 158, 155, 160, 156, 154, 158, 156];

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
    cell: (r) => <span className="nums-tabular">{r.units}</span>,
  },
  {
    key: 'revenue',
    header: 'Revenue',
    align: 'right',
    cell: (r) => <span className="nums-tabular">{usd(r.revenue)}</span>,
  },
];

export default function AdminDashboardPage() {
  const pendingActions = [
    {
      icon: ShoppingCart,
      label: 'orders awaiting fulfillment',
      count: dashboardMetrics.pendingOrders,
      href: '/admin/orders?status=pending',
      cta: 'Pack & ship today',
    },
    {
      icon: Star,
      label: 'reviews to moderate',
      count: dashboardMetrics.reviewsPending,
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
      count: dashboardMetrics.lowStockCount,
      href: '/admin/inventory?filter=low',
      cta: 'Restock or hide',
    },
  ].filter((a) => a.count > 0);

  return (
    <AdminScaffoldPage
      eyebrow="Overview"
      title="Dashboard"
      description="Today at a glance across storefront, fulfillment, and channels."
      actions={<QuickActions />}
    >
      {/* KPI strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Revenue · Today"
          value={usd(dashboardMetrics.revenueToday)}
          delta={dashboardMetrics.revenueTodayDelta}
          helper="vs. yesterday"
          spark={revenueSpark}
        />
        <KpiCard
          label="Orders · Today"
          value={dashboardMetrics.ordersToday}
          delta={dashboardMetrics.ordersTodayDelta}
          helper="vs. yesterday"
          spark={ordersSpark}
        />
        <KpiCard
          label="Average Order Value"
          value={usd(dashboardMetrics.aov)}
          delta={dashboardMetrics.aovDelta}
          helper="7-day avg"
          spark={aovSpark}
        />
        <KpiCard
          label="Low Stock"
          value={dashboardMetrics.lowStockCount}
          helper="below threshold"
          tone={dashboardMetrics.lowStockCount > 0 ? 'warning' : 'neutral'}
        />
      </div>

      {/* Primary row: chart + pending actions */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <AdminSectionCard
          title="Revenue · Last 30 days"
          description={`Total ${usd(revenue30d.reduce((a, b) => a + b, 0))}`}
          action={{ label: 'Orders', href: '/admin/orders' }}
          className="xl:col-span-8"
          bodyClassName="px-4 pt-4 pb-6"
        >
          <RevenueChart points={revenue30d} />
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

      {/* Secondary row: 3 cards */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <AdminSectionCard
          title="Recent Orders"
          description="Latest activity"
          action={{ label: 'View all', href: '/admin/orders' }}
        >
          <AdminTable
            columns={orderCols}
            rows={recentOrders.slice(0, 5)}
            rowKey={(r) => r.id}
          />
        </AdminSectionCard>

        <AdminSectionCard
          title="Top Products"
          description="Last 30 days"
          action={{ label: 'Products', href: '/admin/products' }}
        >
          <AdminTable
            columns={topCols}
            rows={topProducts.slice(0, 5)}
            rowKey={(r) => r.id}
          />
        </AdminSectionCard>

        <AdminSectionCard
          title="Latest Customers"
          description="New + returning shoppers"
          action={{ label: 'View all', href: '/admin/customers' }}
          bodyClassName="p-0"
        >
          <ul className="divide-y divide-border-hairline">
            {recentCustomers.slice(0, 5).map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-3 px-6 py-3"
              >
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
        </AdminSectionCard>
      </div>
    </AdminScaffoldPage>
  );
}
