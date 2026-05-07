import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';

export const metadata: Metadata = {
  title: 'Sakthi Admin',
  robots: { index: false, follow: false },
};

/**
 * Admin shell: fixed 240px sidebar on lg+, mobile drawer via `AdminTopbar`.
 * Kept server-first; only the topbar and sidebar are client components
 * because they need route-aware state and sheet behavior.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-canvas text-text-primary">
      {/* Skip link */}
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-text-primary focus:px-4 focus:py-2 focus:text-bg-canvas"
      >
        Skip to content
      </a>

      <div className="flex min-h-screen">
        <aside className="hidden w-60 flex-shrink-0 border-r border-border-hairline lg:block">
          <div className="sticky top-0 h-screen">
            <AdminSidebar />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar />
          <main
            id="admin-main"
            className="flex-1 px-5 py-8 md:px-8 md:py-10 lg:px-10 lg:py-12"
          >
            <div className="mx-auto w-full max-w-[1400px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
