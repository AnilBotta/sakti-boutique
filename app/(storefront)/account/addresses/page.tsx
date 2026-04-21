import type { Metadata } from 'next';
import { PlaceholderPage } from '@/components/layout/PlaceholderPage';

export const metadata: Metadata = {
  title: 'Saved Addresses',
  description: 'Manage the shipping and billing addresses saved to your Sakthi Trends USA account.',
  robots: { index: false, follow: false },
};

export default function AddressesPage() {
  return <PlaceholderPage eyebrow="Account" title="Saved addresses" />;
}
