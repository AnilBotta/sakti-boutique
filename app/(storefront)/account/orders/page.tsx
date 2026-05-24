import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { requireCustomer } from '@/lib/auth/customer';
import { getServerSupabase } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Order history',
  description: 'Review your Sakthi Trends USA order history and track deliveries.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface OrderRow {
  id: string;
  number: string;
  status: string;
  grand_total: number | string;
  created_at: string;
  item_count: { count: number }[];
}

function usd(n: number) {
  return `$${n.toLocaleString('en-US')}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export default async function OrdersPage() {
  const session = await requireCustomer('/account/orders');

  let orders: Array<{
    id: string;
    number: string;
    status: string;
    total: number;
    placedAt: string;
    itemCount: number;
  }> = [];

  const db = getServerSupabase();
  if (db && session.customerId) {
    const { data, error } = await db
      .from('orders')
      .select(
        'id, number, status, grand_total, created_at, item_count:order_items(count)',
      )
      .eq('customer_id', session.customerId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      console.error('[account.orders]', error.message);
    } else {
      orders = ((data ?? []) as unknown as OrderRow[]).map((o) => ({
        id: o.id,
        number: o.number,
        status: o.status,
        total: Number(o.grand_total),
        placedAt: o.created_at,
        itemCount: o.item_count?.[0]?.count ?? 0,
      }));
    }
  }

  return (
    <Container width="text" className="py-16 md:py-24">
      <Link
        href="/account"
        className="mb-6 inline-flex items-center gap-1.5 text-caption uppercase tracking-[0.12em] text-text-secondary hover:text-text-primary"
      >
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Back to account
      </Link>

      <header className="mb-10">
        <p className="eyebrow text-accent-ember">Account</p>
        <h1 className="mt-3 text-h1 font-medium leading-[1.05] text-text-primary md:text-display">
          Order history
        </h1>
      </header>

      {orders.length === 0 ? (
        <div className="border border-border-hairline bg-bg-canvas px-6 py-14 text-center">
          <p className="text-body text-text-secondary">
            You haven&apos;t placed an order yet.
          </p>
          <p className="mt-2 text-caption text-text-muted">
            When you do, you&apos;ll see status updates and receipts here.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex h-11 items-center justify-center bg-accent-ember px-6 text-caption font-medium uppercase tracking-[0.12em] text-bg-canvas hover:opacity-90"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border-hairline border-y border-border-hairline">
          {orders.map((o) => (
            <li
              key={o.id}
              className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex-1 min-w-0">
                <p className="text-body font-medium text-text-primary nums-tabular">
                  {o.number || o.id.slice(0, 8)}
                </p>
                <p className="mt-1 text-caption text-text-muted">
                  {formatDate(o.placedAt)} ·{' '}
                  {o.itemCount} {o.itemCount === 1 ? 'item' : 'items'}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-caption uppercase tracking-[0.12em] text-text-secondary">
                  {STATUS_LABEL[o.status] ?? o.status}
                </span>
                <span className="text-body font-medium text-text-primary nums-tabular">
                  {usd(o.total)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
