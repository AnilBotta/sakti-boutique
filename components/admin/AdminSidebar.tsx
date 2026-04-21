'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { adminNav } from '@/lib/admin/nav';
import { cn } from '@/lib/utils/cn';

interface AdminSidebarProps {
  onNavigate?: () => void;
  className?: string;
}

export function AdminSidebar({ onNavigate, className }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin"
      className={cn('flex h-full flex-col bg-bg-subtle', className)}
    >
      <Link
        href="/admin"
        onClick={onNavigate}
        aria-label="Sakthi Trends USA Admin"
        className="flex h-16 items-center gap-3 border-b border-border-hairline px-6"
      >
        <Image
          src="/sakthi logo.jpeg"
          alt="Sakthi Trends USA"
          width={120}
          height={56}
          className="h-9 w-auto"
        />
        <span className="eyebrow text-text-muted">Admin</span>
      </Link>

      <div className="flex-1 overflow-y-auto px-3 py-6">
        <ul className="flex flex-col gap-6">
          {adminNav.map((group) => (
            <li key={group.label}>
              <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-[0.14em] text-text-muted">
                {group.label}
              </p>
              <ul className="flex flex-col">
                {group.items.map((item) => {
                  const active =
                    item.href === '/admin'
                      ? pathname === '/admin'
                      : pathname?.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'relative flex h-9 items-center gap-3 px-3 text-caption font-medium transition-colors duration-fast ease-standard',
                          active
                            ? 'bg-bg-muted text-text-primary'
                            : 'text-text-secondary hover:text-text-primary',
                        )}
                      >
                        {active && (
                          <span
                            aria-hidden
                            className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-accent-ember"
                          />
                        )}
                        <Icon className="h-4 w-4" strokeWidth={1.5} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-border-hairline px-6 py-4">
        <Link
          href="/"
          className="text-caption text-text-secondary underline underline-offset-4 transition-colors duration-fast ease-standard hover:text-text-primary"
        >
          ← View storefront
        </Link>
      </div>
    </nav>
  );
}
