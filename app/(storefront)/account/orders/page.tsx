import type { Metadata } from 'next';
import { PlaceholderPage } from '@/components/layout/PlaceholderPage';

export const metadata: Metadata = {
  title: 'Order History',
  description: 'Review your Sakthi Trends USA order history and track deliveries.',
  robots: { index: false, follow: false },
};

export default function OrdersPage() {
  return <PlaceholderPage eyebrow="Account" title="Order history" />;
}
