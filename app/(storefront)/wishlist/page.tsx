import type { Metadata } from 'next';
import { PlaceholderPage } from '@/components/layout/PlaceholderPage';

export const metadata: Metadata = {
  title: 'Wishlist',
  description: 'The pieces you love, saved for later.',
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return <PlaceholderPage eyebrow="Saved" title="Your wishlist" />;
}
