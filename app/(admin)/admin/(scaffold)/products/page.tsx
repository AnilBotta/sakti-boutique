import Link from 'next/link';
import { Plus, PackageOpen } from 'lucide-react';
import { AdminScaffoldPage } from '@/components/admin/AdminScaffoldPage';
import { resolveAdminNavItem } from '@/lib/admin/nav';
import { listAdminProducts } from '@/lib/repositories/admin-products';
import { AdminProductsClient } from './AdminProductsClient';

export default async function AdminProductsPage() {
  const rows = await listAdminProducts();
  const meta = resolveAdminNavItem('/admin/products');

  return (
    <AdminScaffoldPage
      eyebrow={meta?.eyebrow ?? 'Catalog'}
      title={meta?.label ?? 'Products'}
      description={
        meta?.description ??
        'Create, edit, and publish products across the Sakthi catalog.'
      }
      actions={
        <Link
          href="/admin/products/new"
          className="inline-flex h-10 items-center gap-2 bg-accent-ember px-4 text-caption font-medium uppercase tracking-[0.12em] text-bg-canvas transition-opacity duration-fast ease-standard hover:opacity-90"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          New product
        </Link>
      }
    >
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 border border-border-hairline bg-bg-canvas px-6 py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center border border-border-hairline text-text-secondary">
            <PackageOpen className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-h3 font-medium text-text-primary">
              No products yet
            </h2>
            <p className="mt-1 text-caption text-text-muted">
              Create your first product to start the catalog.
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="inline-flex h-10 items-center gap-2 bg-accent-ember px-4 text-caption font-medium uppercase tracking-[0.12em] text-bg-canvas"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Create your first product
          </Link>
        </div>
      ) : (
        <AdminProductsClient initialRows={rows} />
      )}
    </AdminScaffoldPage>
  );
}
