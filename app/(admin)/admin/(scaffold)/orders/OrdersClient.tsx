'use client';

import { useState, useMemo, useTransition } from 'react';
import { ChevronRight } from 'lucide-react';
import { AdminSectionCard } from '@/components/admin/AdminSectionCard';
import { AdminFilterBar } from '@/components/admin/AdminFilterBar';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import type { AdminOrderRow, OrderStatus } from '@/lib/admin/mock-data';
import {
  advanceOrderStatusAction,
  cancelOrderAction,
} from '@/lib/actions/admin-orders';

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

interface Props {
  initialOrders: AdminOrderRow[];
}

export function OrdersClient({ initialOrders }: Props) {
  const orders = initialOrders;
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

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

  function advance(id: string) {
    setPendingId(id);
    startTransition(async () => {
      const res = await advanceOrderStatusAction(id);
      setPendingId(null);
      if (!res.ok) alert(res.message ?? 'Could not advance order');
    });
  }
  function cancel(id: string) {
    if (!confirm('Cancel this order?')) return;
    setPendingId(id);
    startTransition(async () => {
      const res = await cancelOrderAction(id);
      setPendingId(null);
      if (!res.ok) alert(res.message ?? 'Could not cancel order');
    });
  }

  return (
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
                const busy = pendingId === o.id;
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
                            onClick={() => advance(o.id)}
                            disabled={busy}
                            className="inline-flex h-8 items-center gap-1 border border-accent-ember/40 px-2 text-[11px] font-medium uppercase tracking-[0.12em] text-accent-ember hover:bg-bg-subtle disabled:opacity-40"
                          >
                            {next}
                            <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
                          </button>
                        )}
                        {o.status !== 'cancelled' && o.status !== 'delivered' && (
                          <button
                            type="button"
                            onClick={() => cancel(o.id)}
                            disabled={busy}
                            className="inline-flex h-8 items-center px-2 text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted hover:text-accent-crimson disabled:opacity-40"
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
  );
}
