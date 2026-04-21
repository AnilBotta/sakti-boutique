// Placeholder admin data. Clearly temporary — swap for Supabase queries in
// later steps. Values are believable but static.

import { products } from '@/lib/catalog/products';

export const dashboardMetrics = {
  revenueToday: 4820,
  revenueTodayDelta: 0.12,
  ordersToday: 31,
  ordersTodayDelta: 0.08,
  pendingOrders: 9,
  lowStockCount: 6,
  tryOnSessionsToday: 84,
  tryOnSuccessRate: 0.92,
  reviewsPending: 4,
  amazonListed: 42,
  amazonErrors: 2,
  aov: 156,
  aovDelta: -0.03,
};

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface AdminOrderRow {
  id: string;
  customer: string;
  items: number;
  total: number;
  status: OrderStatus;
  placedAt: string;
  channel: 'Web' | 'Amazon';
}

export const recentOrders: AdminOrderRow[] = [
  { id: 'SB-10284', customer: 'Aisha K.',    items: 2, total: 412, status: 'paid',      placedAt: '2026-04-08 09:12', channel: 'Web' },
  { id: 'SB-10283', customer: 'Priya R.',    items: 1, total: 248, status: 'pending',   placedAt: '2026-04-08 08:47', channel: 'Web' },
  { id: 'SB-10282', customer: 'Divya N.',    items: 3, total: 612, status: 'packed',    placedAt: '2026-04-08 08:05', channel: 'Web' },
  { id: 'SB-10281', customer: 'Meera S.',    items: 1, total: 624, status: 'shipped',   placedAt: '2026-04-07 21:18', channel: 'Amazon' },
  { id: 'SB-10280', customer: 'Ananya P.',   items: 2, total: 296, status: 'delivered', placedAt: '2026-04-07 19:02', channel: 'Web' },
  { id: 'SB-10279', customer: 'Rohan M.',    items: 1, total: 128, status: 'refunded',  placedAt: '2026-04-07 15:30', channel: 'Web' },
  { id: 'SB-10278', customer: 'Tara J.',     items: 4, total: 788, status: 'paid',      placedAt: '2026-04-07 12:11', channel: 'Web' },
];

export interface LowStockRow {
  id: string;
  name: string;
  sku: string;
  remaining: number;
  category: string;
}

export const lowStock: LowStockRow[] = products.slice(0, 6).map((p, i) => ({
  id: p.id,
  name: p.name,
  sku: `${p.id.toUpperCase()}-${(p.sizes[0] ?? 'OS')}`,
  remaining: [2, 1, 3, 4, 2, 5][i] ?? 3,
  category: p.category,
}));

export interface TopProductRow {
  id: string;
  name: string;
  units: number;
  revenue: number;
}

export const topProducts: TopProductRow[] = [
  { id: 'w-sa-1', name: 'Meera Banarasi Silk Saree',        units: 18, revenue: 7416 },
  { id: 'w-l-1',  name: 'Tara Hand-Block Lehenga',          units: 11, revenue: 6864 },
  { id: 'w-k-1',  name: 'Aanya Hand-Embroidered Kurthi Set', units: 22, revenue: 5456 },
  { id: 'w-s-1',  name: 'Mira Anarkali Salwar Suit',        units: 14, revenue: 4004 },
  { id: 'm-k-1',  name: 'Ishaan Cotton Kurtha',             units: 26, revenue: 3328 },
];

export type AmazonStatus = 'listed' | 'pending' | 'error' | 'suppressed' | 'draft';

export interface AmazonRow {
  id: string;
  name: string;
  asin: string | null;
  sku: string;
  status: AmazonStatus;
  lastSync: string;
  error?: string;
}

export const amazonListings: AmazonRow[] = [
  { id: 'w-sa-1', name: 'Meera Banarasi Silk Saree',        asin: 'B0C8XXXX01', sku: 'SB-WSA-1', status: 'listed',     lastSync: '2026-04-08 06:00' },
  { id: 'w-k-1',  name: 'Aanya Hand-Embroidered Kurthi Set', asin: 'B0C8XXXX02', sku: 'SB-WK-1',  status: 'listed',     lastSync: '2026-04-08 06:00' },
  { id: 'w-l-1',  name: 'Tara Hand-Block Lehenga',          asin: null,         sku: 'SB-WL-1',  status: 'pending',    lastSync: '2026-04-08 05:50' },
  { id: 'w-sa-3', name: 'Radhika Organza Saree',            asin: 'B0C8XXXX03', sku: 'SB-WSA-3', status: 'error',      lastSync: '2026-04-08 05:45', error: 'Image resolution below marketplace minimum' },
  { id: 'm-sh-1', name: 'Arjun Linen Shirt',                asin: 'B0C8XXXX04', sku: 'SB-MSH-1', status: 'suppressed', lastSync: '2026-04-07 22:00', error: 'Price outside allowed range' },
];

export type ReviewStatus = 'pending' | 'approved' | 'hidden';

export interface ReviewRow {
  id: string;
  product: string;
  author: string;
  rating: number;
  excerpt: string;
  status: ReviewStatus;
  submittedAt: string;
}

export const reviewQueue: ReviewRow[] = [
  { id: 'rv-1', product: 'Meera Banarasi Silk Saree',        author: 'Kavya M.',  rating: 5, excerpt: 'Stunning weave, arrived beautifully packed.',     status: 'pending',  submittedAt: '2026-04-08 07:40' },
  { id: 'rv-2', product: 'Tara Hand-Block Lehenga',          author: 'Isha P.',   rating: 4, excerpt: 'Gorgeous piece, fit is slightly loose at waist.', status: 'pending',  submittedAt: '2026-04-07 18:22' },
  { id: 'rv-3', product: 'Aanya Hand-Embroidered Kurthi Set', author: 'Radhika S.', rating: 5, excerpt: 'Love the embroidery detail — will buy again.',   status: 'pending',  submittedAt: '2026-04-07 15:05' },
  { id: 'rv-4', product: 'Ishaan Cotton Kurtha',             author: 'Arun K.',   rating: 3, excerpt: 'Comfortable but color a shade off photo.',        status: 'approved', submittedAt: '2026-04-06 11:12' },
];

export interface CustomerRow {
  id: string;
  name: string;
  email: string;
  orders: number;
  lifetime: number;
  lastOrder: string;
}

export const recentCustomers: CustomerRow[] = [
  { id: 'c-1', name: 'Aisha K.',  email: 'aisha@example.com',  orders: 4, lifetime: 1284, lastOrder: '2026-04-08' },
  { id: 'c-2', name: 'Priya R.',  email: 'priya@example.com',  orders: 2, lifetime: 496,  lastOrder: '2026-04-08' },
  { id: 'c-3', name: 'Divya N.',  email: 'divya@example.com',  orders: 6, lifetime: 2110, lastOrder: '2026-04-08' },
  { id: 'c-4', name: 'Meera S.',  email: 'meera@example.com',  orders: 1, lifetime: 624,  lastOrder: '2026-04-07' },
  { id: 'c-5', name: 'Ananya P.', email: 'ananya@example.com', orders: 3, lifetime: 812,  lastOrder: '2026-04-07' },
];

export const tryOnSummary = {
  jobsToday: 84,
  successRate: 0.92,
  avgLatencyMs: 4800,
  failures24h: 7,
  enabledProducts: 34,
};

export const contentPages = [
  { slug: 'about',    title: 'About Us',    status: 'published', updated: '2026-03-22' },
  { slug: 'faq',      title: 'FAQ',         status: 'published', updated: '2026-03-15' },
  { slug: 'contact',  title: 'Contact Us',  status: 'published', updated: '2026-02-28' },
  { slug: 'lookbook', title: 'Spring Lookbook', status: 'draft', updated: '2026-04-05' },
];
