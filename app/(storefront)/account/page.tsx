import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShoppingBag,
  Heart,
  MapPin,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { requireCustomer } from '@/lib/auth/customer';
import { signOutAction } from '@/lib/actions/storefront-auth';

export const metadata: Metadata = {
  title: 'My account',
  description: 'Manage your Sakthi Trends USA profile, orders, and saved addresses.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

function usd(n: number) {
  return `$${n.toLocaleString('en-US')}`;
}

function firstName(full: string | null, email: string): string {
  if (full) return full.split(/\s+/)[0];
  return email.split('@')[0];
}

interface AccountLink {
  href: string;
  label: string;
  description: string;
  icon: typeof ShoppingBag;
}

const NAV: AccountLink[] = [
  {
    href: '/account/orders',
    label: 'Orders',
    description: 'Track and review past orders',
    icon: ShoppingBag,
  },
  {
    href: '/account/addresses',
    label: 'Addresses',
    description: 'Saved shipping and billing addresses',
    icon: MapPin,
  },
  {
    href: '/wishlist',
    label: 'Wishlist',
    description: 'Pieces you saved for later',
    icon: Heart,
  },
];

export default async function AccountPage() {
  const session = await requireCustomer('/account');

  return (
    <Container width="text" className="py-16 md:py-24">
      <header className="mb-10 md:mb-14">
        <p className="eyebrow text-accent-ember">Welcome back</p>
        <h1 className="mt-3 text-h1 font-medium leading-[1.05] text-text-primary md:text-display">
          {firstName(session.fullName, session.email)}
        </h1>
        <p className="mt-3 text-body text-text-secondary">
          Signed in as <span className="font-medium text-text-primary">{session.email}</span>
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="border border-border-hairline bg-bg-canvas p-5">
          <p className="eyebrow text-text-secondary">Lifetime spend</p>
          <p className="mt-2 text-h3 font-medium text-text-primary nums-tabular">
            {usd(session.lifetimeValue)}
          </p>
        </div>
        <div className="border border-border-hairline bg-bg-canvas p-5">
          <p className="eyebrow text-text-secondary">Orders</p>
          <p className="mt-2 text-h3 font-medium text-text-primary nums-tabular">
            {session.orderCount}
          </p>
        </div>
        <div className="border border-border-hairline bg-bg-canvas p-5">
          <p className="eyebrow text-text-secondary">Member since</p>
          <p className="mt-2 text-h3 font-medium text-text-primary nums-tabular">
            {new Date(session.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
            })}
          </p>
        </div>
      </div>

      <ul className="mt-10 divide-y divide-border-hairline border-y border-border-hairline">
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex items-center gap-4 py-5 transition-colors duration-fast ease-standard hover:bg-bg-subtle"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-border-hairline bg-bg-canvas text-text-secondary">
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-body font-medium text-text-primary">
                    {item.label}
                  </p>
                  <p className="text-caption text-text-muted">
                    {item.description}
                  </p>
                </div>
                <ChevronRight
                  className="h-4 w-4 flex-shrink-0 text-text-muted transition-transform duration-fast ease-standard group-hover:translate-x-0.5"
                  strokeWidth={1.5}
                />
              </Link>
            </li>
          );
        })}
      </ul>

      <form action={signOutAction} className="mt-10">
        <button
          type="submit"
          className="inline-flex h-11 items-center gap-2 border border-border-default bg-bg-canvas px-5 text-caption font-medium uppercase tracking-[0.12em] text-text-primary transition-colors duration-fast ease-standard hover:bg-bg-subtle"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          Sign out
        </button>
      </form>
    </Container>
  );
}
