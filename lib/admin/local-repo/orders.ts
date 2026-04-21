'use client';

import {
  readCollection,
  writeCollection,
  useCollection,
  generateId,
} from '@/lib/admin/local-store';
import {
  recentOrders,
  type AdminOrderRow,
  type OrderStatus,
} from '@/lib/admin/mock-data';

const COLLECTION = 'orders';

const seed = (): AdminOrderRow[] => recentOrders.map((o) => ({ ...o }));

const statusFlow: Record<OrderStatus, OrderStatus | null> = {
  pending: 'paid',
  paid: 'packed',
  packed: 'shipped',
  shipped: 'delivered',
  delivered: null,
  cancelled: null,
  refunded: null,
};

export function useAdminOrders(): [
  AdminOrderRow[],
  {
    advance: (id: string) => void;
    cancel: (id: string) => void;
    createTestOrder: () => AdminOrderRow;
  },
] {
  const [orders, setOrders] = useCollection<AdminOrderRow>(COLLECTION, seed());

  const advance = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const next = statusFlow[o.status];
        if (!next) return o;
        return { ...o, status: next };
      }),
    );
  };

  const cancel = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'cancelled' } : o)),
    );
  };

  const createTestOrder = (): AdminOrderRow => {
    const customers = ['Aisha K.', 'Priya R.', 'Divya N.', 'Meera S.', 'Tara J.'];
    const order: AdminOrderRow = {
      id: `SB-${generateId('ord').slice(-5).toUpperCase()}`,
      customer: customers[Math.floor(Math.random() * customers.length)],
      items: 1 + Math.floor(Math.random() * 3),
      total: 100 + Math.floor(Math.random() * 700),
      status: 'pending',
      placedAt: new Date()
        .toISOString()
        .replace('T', ' ')
        .slice(0, 16),
      channel: Math.random() > 0.85 ? 'Amazon' : 'Web',
    };
    setOrders((prev) => [order, ...prev]);
    return order;
  };

  return [orders, { advance, cancel, createTestOrder }];
}

export function listOrders(): AdminOrderRow[] {
  return readCollection<AdminOrderRow>(COLLECTION, seed());
}

export function setOrders(next: AdminOrderRow[]) {
  writeCollection<AdminOrderRow>(COLLECTION, next);
}
