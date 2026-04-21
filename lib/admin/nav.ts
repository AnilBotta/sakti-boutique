import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Star,
  FileText,
  Store,
  Sparkles,
  Boxes,
  BellRing,
  type LucideIcon,
} from 'lucide-react';

/**
 * Admin navigation source of truth.
 *
 * Every admin route is declared here with structured metadata so the sidebar,
 * topbar, breadcrumbs, page headers, and future badge/count systems can all
 * read from a single place. Keep this file lightweight — no permission logic,
 * no fetching, no runtime behavior. It is pure metadata.
 */

/** Stable machine id for a route, used as a key for badge counts etc. */
export type AdminNavKey =
  | 'dashboard'
  | 'products'
  | 'inventory'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'reviews'
  | 'alerts'
  | 'content'
  | 'amazon'
  | 'tryon';

/** Stable machine id for a nav section group. */
export type AdminNavSection = 'overview' | 'catalog' | 'commerce' | 'channels';

/**
 * Placeholder keys for future live badge/count indicators. Resolving these
 * to real numbers is a Step 9+ concern — for now they just reserve the slot
 * so the sidebar can render a dot or count without another refactor.
 */
export type AdminBadgeKey =
  | 'orders.pending'
  | 'reviews.pending'
  | 'inventory.lowStock'
  | 'amazon.errors'
  | 'tryon.failed';

export interface AdminNavItem {
  /** Stable machine id — never change once shipped. */
  key: AdminNavKey;
  /** Human label shown in sidebar and page header. */
  label: string;
  /** Route path. */
  href: string;
  /** Section this item belongs to. */
  section: AdminNavSection;
  /** Lucide icon used in sidebar + mobile drawer. */
  icon: LucideIcon;
  /** Short one-line description for page header + future command palette. */
  description: string;
  /** Eyebrow used above the page title on the route. */
  eyebrow: string;
  /** Optional badge/count key placeholder — resolved to a number later. */
  badgeKey?: AdminBadgeKey;
  /**
   * True when the route is UI-only today (no real CRUD / backend yet).
   * Useful for tagging "Preview" ribbons and excluding from smoke tests.
   */
  scaffoldOnly?: boolean;
}

export interface AdminNavGroup {
  /** Stable section id. */
  key: AdminNavSection;
  /** Section label shown in the sidebar. */
  label: string;
  items: AdminNavItem[];
}

export const adminNav: AdminNavGroup[] = [
  {
    key: 'overview',
    label: 'Overview',
    items: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        href: '/admin',
        section: 'overview',
        icon: LayoutDashboard,
        eyebrow: 'Overview',
        description: 'Today\u2019s revenue, orders, and operational alerts.',
      },
    ],
  },
  {
    key: 'catalog',
    label: 'Catalog',
    items: [
      {
        key: 'products',
        label: 'Products',
        href: '/admin/products',
        section: 'catalog',
        icon: Package,
        eyebrow: 'Catalog',
        description: 'Create, edit, and archive products across the locked category tree.',
      },
      {
        key: 'inventory',
        label: 'Inventory',
        href: '/admin/inventory',
        section: 'catalog',
        icon: Boxes,
        eyebrow: 'Catalog',
        description: 'Stock levels, low-stock alerts, and variant availability.',
        badgeKey: 'inventory.lowStock',
      },
      {
        key: 'categories',
        label: 'Categories',
        href: '/admin/categories',
        section: 'catalog',
        icon: FolderTree,
        eyebrow: 'Catalog',
        description: 'Manage the locked Women / Men / Kids taxonomy and banners.',
      },
    ],
  },
  {
    key: 'commerce',
    label: 'Commerce',
    items: [
      {
        key: 'orders',
        label: 'Orders',
        href: '/admin/orders',
        section: 'commerce',
        icon: ShoppingCart,
        eyebrow: 'Commerce',
        description: 'Fulfilment pipeline from pending through delivered.',
        badgeKey: 'orders.pending',
      },
      {
        key: 'customers',
        label: 'Customers',
        href: '/admin/customers',
        section: 'commerce',
        icon: Users,
        eyebrow: 'Commerce',
        description: 'Customer profiles, lifetime value, and order history.',
        scaffoldOnly: true,
      },
      {
        key: 'reviews',
        label: 'Reviews',
        href: '/admin/reviews',
        section: 'commerce',
        icon: Star,
        eyebrow: 'Commerce',
        description: 'Moderate customer reviews before they reach product pages.',
        badgeKey: 'reviews.pending',
      },
      {
        key: 'alerts',
        label: 'Stock Alerts',
        href: '/admin/alerts',
        section: 'commerce',
        icon: BellRing,
        eyebrow: 'Commerce',
        description: 'Customers waiting on back-in-stock notifications.',
        scaffoldOnly: true,
      },
    ],
  },
  {
    key: 'channels',
    label: 'Content & Channels',
    items: [
      {
        key: 'content',
        label: 'Content',
        href: '/admin/content',
        section: 'channels',
        icon: FileText,
        eyebrow: 'Content',
        description: 'About, FAQ, Contact, lookbooks, and editorial pages.',
        scaffoldOnly: true,
      },
      {
        key: 'amazon',
        label: 'Amazon',
        href: '/admin/amazon',
        section: 'channels',
        icon: Store,
        eyebrow: 'Channels',
        description: 'Secondary channel listing status and sync health.',
        badgeKey: 'amazon.errors',
        scaffoldOnly: true,
      },
      {
        key: 'tryon',
        label: 'Try-On',
        href: '/admin/tryon',
        section: 'channels',
        icon: Sparkles,
        eyebrow: 'Experiences',
        description: 'Virtual Try-On job health, success rates, and eligibility.',
        badgeKey: 'tryon.failed',
        scaffoldOnly: true,
      },
    ],
  },
];

/** Flat list in sidebar order — handy for breadcrumbs and command palettes. */
export const flatAdminNav: AdminNavItem[] = adminNav.flatMap((g) => g.items);

/** Lookup by stable key. */
export const adminNavByKey: Record<AdminNavKey, AdminNavItem> = flatAdminNav.reduce(
  (acc, item) => {
    acc[item.key] = item;
    return acc;
  },
  {} as Record<AdminNavKey, AdminNavItem>,
);

/** Resolve a pathname to the matching nav item (longest-prefix match). */
export function resolveAdminNavItem(pathname: string): AdminNavItem | undefined {
  const matches = flatAdminNav
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length);
  return matches[0];
}
