'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, Search, User, Heart, ShoppingBag } from 'lucide-react';
import { primaryNav } from '@/lib/site/navigation';
import { useCart, selectItemCount } from '@/lib/cart/store';
import { MobileDrawer } from './MobileDrawer';

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openCart = useCart((s) => s.open);
  const cartCount = useCart(selectItemCount);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border-hairline bg-bg-canvas/90 backdrop-blur-sm">
        <div className="mx-auto flex h-[60px] max-w-container-editorial items-center justify-between px-5 md:h-[72px] md:px-8 lg:px-12">
          {/* Mobile menu */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="flex h-11 w-11 items-center justify-center lg:hidden"
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>

          {/* Logo */}
          <Link
            href="/"
            aria-label="Sakthi Trends USA — Home"
            className="flex items-center lg:ml-0"
          >
            <Image
              src="/sakthi logo.jpeg"
              alt="Sakthi Trends USA"
              width={200}
              height={108}
              priority
              className="h-9 w-auto md:h-11"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex lg:items-center lg:gap-10">
            {primaryNav.map((section) => (
              <Link
                key={section.audience}
                href={section.href}
                className="text-body font-medium text-text-primary hover:text-accent-ember transition-colors duration-fast ease-standard"
              >
                {section.label}
              </Link>
            ))}
            <Link
              href="/about"
              className="text-body font-medium text-text-primary hover:text-accent-ember transition-colors duration-fast ease-standard"
            >
              About
            </Link>
          </nav>

          {/* Utility */}
          <div className="flex items-center gap-1 md:gap-2">
            <button
              aria-label="Search"
              className="hidden h-11 w-11 items-center justify-center md:flex"
            >
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <Link
              href="/account"
              aria-label="Account"
              className="hidden h-11 w-11 items-center justify-center md:flex"
            >
              <User className="h-5 w-5" strokeWidth={1.5} />
            </Link>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="flex h-11 w-11 items-center justify-center"
            >
              <Heart className="h-5 w-5" strokeWidth={1.5} />
            </Link>
            <button
              type="button"
              onClick={openCart}
              aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
              className="relative flex h-11 w-11 items-center justify-center"
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-ember px-1 text-[10px] font-medium leading-none text-bg-canvas nums-tabular">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
