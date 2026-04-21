'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, Bell, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { AdminSidebar } from './AdminSidebar';

export function AdminTopbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border-hairline bg-bg-canvas/95 px-4 backdrop-blur lg:h-16 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            className="flex h-10 w-10 items-center justify-center text-text-primary lg:hidden"
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <Link
            href="/admin"
            aria-label="Sakthi Trends USA Admin"
            className="flex items-center gap-2 lg:hidden"
          >
            <Image
              src="/sakthi logo.jpeg"
              alt="Sakthi Trends USA"
              width={96}
              height={44}
              className="h-7 w-auto"
            />
            <span className="eyebrow text-text-muted">Admin</span>
          </Link>
        </div>

        <div className="hidden flex-1 px-6 lg:block lg:max-w-md">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
              strokeWidth={1.5}
            />
            <input
              type="search"
              placeholder="Search orders, products, customers…"
              className="h-10 w-full border border-border-hairline bg-bg-canvas pl-9 pr-3 text-caption text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-ember focus:ring-offset-2"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center text-text-secondary transition-colors duration-fast ease-standard hover:text-text-primary"
          >
            <Bell className="h-5 w-5" strokeWidth={1.5} />
            <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-accent-ember" />
          </button>
          <div
            className="hidden h-9 w-9 items-center justify-center border border-border-hairline bg-bg-muted text-caption font-medium text-text-primary md:flex"
            aria-label="Operator Anil"
          >
            AB
          </div>
        </div>
      </header>

      {/* Mobile sidebar drawer */}
      <div
        aria-hidden={!open}
        className={cn(
          'fixed inset-0 z-40 lg:hidden',
          open ? 'pointer-events-auto' : 'pointer-events-none',
        )}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            'absolute inset-0 bg-[rgba(15,15,15,0.4)] transition-opacity duration-fast ease-standard',
            open ? 'opacity-100' : 'opacity-0',
          )}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation"
          className={cn(
            'absolute left-0 top-0 h-full w-[82vw] max-w-[320px] bg-bg-subtle shadow-float',
            'transition-transform duration-base ease-standard',
            open ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center text-text-secondary"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <AdminSidebar onNavigate={() => setOpen(false)} />
        </aside>
      </div>
    </>
  );
}
