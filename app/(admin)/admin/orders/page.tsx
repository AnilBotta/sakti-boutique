'use client';

import { useState, useMemo } from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import { AdminScaffoldPage } from '@/components/admin/AdminScaffoldPage';
import { AdminSectionCard } from '@/components/admin/AdminSectionCard';
import { AdminFilterBar } from '@/components/admin/AdminFilterBar';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { useAdminOrders } from '@/lib/admin/local-repo/orders';
import type { OrderStatus } from '@/lib/admin/mock-data';

const STATUS_FILTERS: Array<OrderStatus | 'all'> = [
  'all',
  'pending',
  'paid',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
];

const NEXT_LABEL: Record<OrderStatus, string | null> = {
  pending: 'Mark paid',
  paid: 'Mark packed',
  packed: 'Mark shipped',
  shipped: 'Mark delivered',
  delivered: null,
  cancelled: null,
  refunded: null,
};

export default function AdminOrdersPage() {
  const [orders, ops] = useAdminOrders();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== 'all' && o.status !== filter) return false;
      if (
        q &&
        !o.id.toLowerCase().includes(q) &&
        !o.customer.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [orders, search, filter]);

  const counts = STATUS_FILTERS.reduce<Record<string, number>>((acc, s) => {
    acc[s] = s === 'all' ? orders.length : orders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  return (
    <AdminScaffoldPage
      eyebrow="Commerce"
      title="Orders"
      description="Pack, ship, and track orders. Use the test order button to rehearse the fulfillment flow."
      actions={
        <button
          type="button"
          onClick={() => ops.createTestOrder()}
          className="inline-flex h-10 items-center gap-2 bg-text-primary px-4 text-caption font-medium uppercase tracking-[0.12em] text-bg-canvas hover:opacity-90"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Create test order
        </button>
      }
    >
      <AdminSectionCard
        title="All orders"
        description={`${filtered.length} of ${orders.length} orders`}
      >
        <div className="flex flex-col gap-3 border-b border-border-hairline px-4 py-4">
          <AdminFilterBar
            searchPlaceholder="Search by order # or customer…"
            value={search}
            onChange={setSearch}
          />
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={`inline-flex h-8 items-center border px-3 text-[11px] font-medium uppercase tracking-[0.12em] capitalize ${
                  filter === s
                    ? 'border-accent-ember bg-bg-muted text-accent-ember'
                    : 'border-border-hairline text-text-secondary hover:bg-bg-subtle'
                }`}
              >
                {s} ({counts[s]})
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="px-6 py-12 text-center text-caption text-text-muted">
            No orders match these filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-caption">
              <thead className="border-b border-border-hairline bg-bg-subtle">
                <tr>
                  <th className="px-4 py-3 text-left font-medium uppercase tracking-[0.12em] text-text-muted">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left font-medium uppercase tracking-[0.12em] text-text-muted">
                    Customer
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium uppercase tracking-[0.12em] text-text-muted md:table-cell">
                    Channel
                  </th>
                  <th className="px-4 py-3 text-right font-medium uppercase tracking-[0.12em] text-text-muted">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left font-medium uppercase tracking-[0.12em] text-text-muted">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right font-medium uppercase tracking-[0.12em] text-text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-hairline">
                {filtered.map((o) => {
                  const next = NEXT_LABEL[o.status];
                  return (
                    <tr key={o.id} className="hover:bg-bg-subtle">
                      <td className="px-4 py-2 font-medium text-text-primary nums-tabular">
                        {o.id}
                      </td>
                      <td className="px-4 py-2">{o.customer}</td>
                      <td className="hidden px-4 py-2 text-text-muted md:table-cell">
                        {o.channel}
                      </td>
                      <td className="px-4 py-2 text-right nums-tabular">
                        ${o.total}
                      </td>
                      <td className="px-4 py-2">
                        <AdminStatusBadge status={o.status} />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="inline-flex items-center gap-1">
                          {next && (
                            <button
                              type="button"
                              onClick={() => ops.advance(o.id)}
                              className="inline-flex h-8 items-center gap-1 border border-accent-ember/40 px-2 text-[11px] font-medium uppercase tracking-[0.12em] text-accent-ember hover:bg-bg-subtle"
                            >
                              {next}
                              <ChevronRight
                                className="h-3 w-3"
                                strokeWidth={1.5}
                              />
                            </button>
                          )}
                          {o.status !== 'cancelled' && o.status !== 'delivered' && (
                            <button
                              type="button"
                              onClick={() => ops.cancel(o.id)}
                              className="inline-flex h-8 items-center px-2 text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted hover:text-accent-crimson"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminSectionCard>
    </AdminScaffoldPage>
  );
}
