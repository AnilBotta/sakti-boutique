'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, ChevronDown } from 'lucide-react';
import { primaryNav } from '@/lib/site/navigation';
import { cn } from '@/lib/utils/cn';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div
      aria-hidden={!open}
      className={cn(
        'fixed inset-0 z-50 lg:hidden',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      )}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-[rgba(15,15,15,0.4)] transition-opacity duration-fast ease-standard',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />

      {/* Sheet */}
      <aside
        role="dialog"
        aria-label="Main navigation"
        className={cn(
          'absolute right-0 top-0 h-full w-[88vw] max-w-[420px] bg-bg-canvas shadow-float',
          'transition-transform duration-base ease-standard',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <header className="flex h-16 items-center justify-between border-b border-border-hairline px-5">
          <span className="font-medium tracking-tight">Sakthi</span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-11 w-11 items-center justify-center"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </header>

        <nav className="overflow-y-auto px-5 py-6">
          <ul className="flex flex-col">
            {primaryNav.map((section) => {
              const isOpen = openSection === section.audience;
              return (
                <li key={section.audience} className="border-b border-border-hairline">
                  <button
                    onClick={() =>
                      setOpenSection(isOpen ? null : section.audience)
                    }
                    className="flex h-14 w-full items-center justify-between text-left"
                  >
                    <span className="text-h3 font-medium">{section.label}</span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform duration-fast ease-standard',
                        isOpen && 'rotate-180',
                      )}
                      strokeWidth={1.5}
                    />
                  </button>
                  {isOpen && (
                    <ul className="pb-4">
                      {section.categories.map((cat) => (
                        <li key={cat.href}>
                          <Link
                            href={cat.href}
                            onClick={onClose}
                            className="block py-3 text-body text-text-secondary"
                          >
                            {cat.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-8 flex flex-col gap-3 text-body text-text-secondary">
            <Link href="/account" onClick={onClose}>Account</Link>
            <Link href="/wishlist" onClick={onClose}>Wishlist</Link>
            <Link href="/about" onClick={onClose}>About</Link>
            <Link href="/contact" onClick={onClose}>Contact</Link>
          </div>
        </nav>
      </aside>
    </div>
  );
}
