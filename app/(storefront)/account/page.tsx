import type { Metadata } from 'next';
import { PlaceholderPage } from '@/components/layout/PlaceholderPage';

export const metadata: Metadata = {
  title: 'My Account',
  description: 'Manage your Sakthi Trends USA profile, orders, and saved addresses.',
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <PlaceholderPage eyebrow="Account" title="My account" />;
}
