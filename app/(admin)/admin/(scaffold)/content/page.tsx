import Link from 'next/link';
import { Plus, Info } from 'lucide-react';
import { AdminScaffoldPage } from '@/components/admin/AdminScaffoldPage';
import { AdminSectionCard } from '@/components/admin/AdminSectionCard';
import { AdminTable, type AdminColumn } from '@/components/admin/AdminTable';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { listContentPages, type ContentPageRow } from '@/lib/repositories/content';

export const dynamic = 'force-dynamic';

const cols: AdminColumn<ContentPageRow>[] = [
  {
    key: 'title',
    header: 'Page',
    cell: (r) => (
      <Link
        href={`/admin/content/${r.slug}`}
        className="font-medium text-text-primary underline-offset-4 hover:underline"
      >
        {r.title}
      </Link>
    ),
  },
  {
    key: 'slug',
    header: 'Slug',
    hideOn: 'sm',
    cell: (r) => <span className="text-text-muted">/journal/{r.slug}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    cell: (r) => <AdminStatusBadge status={r.status} />,
  },
  {
    key: 'updated',
    header: 'Updated',
    hideOn: 'md',
    cell: (r) => (
      <span className="text-text-muted nums-tabular">{r.updated}</span>
    ),
  },
];

const CODE_MANAGED_PAGES = [
  { title: 'About Us', href: '/about' },
  { title: 'FAQ', href: '/faq' },
  { title: 'Contact Us', href: '/contact' },
];

export default async function AdminContentPage() {
  const rows = await listContentPages();

  return (
    <AdminScaffoldPage
      eyebrow="Content"
      title="Content Pages"
      description="Create editorial pages — lookbooks, journal entries, brand stories. Published pages render at /journal/{slug}."
      actions={
        <Link
          href="/admin/content/new"
          className="inline-flex h-11 items-center gap-2 bg-accent-ember px-5 text-caption font-medium uppercase tracking-[0.12em] text-bg-canvas transition-opacity duration-fast ease-standard hover:opacity-90"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          New page
        </Link>
      }
    >
      <AdminSectionCard
        title="Editorial pages"
        description={rows.length === 0 ? undefined : `${rows.length} total`}
        bodyClassName={rows.length === 0 ? 'p-0' : undefined}
      >
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
            <p className="text-body text-text-secondary">No pages yet.</p>
            <p className="max-w-md text-caption text-text-muted">
              Use editorial pages for lookbooks, journal posts, or brand
              stories. They publish to <code>/journal/{'{slug}'}</code> and
              don&apos;t require a code deploy.
            </p>
            <Link
              href="/admin/content/new"
              className="mt-2 inline-flex h-11 items-center gap-2 bg-accent-ember px-5 text-caption font-medium uppercase tracking-[0.12em] text-bg-canvas hover:opacity-90"
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              Create your first page
            </Link>
          </div>
        ) : (
          <AdminTable columns={cols} rows={rows} rowKey={(r) => r.slug} />
        )}
      </AdminSectionCard>

      <AdminSectionCard
        title="Built-in pages"
        description="Managed in code — preview only"
        bodyClassName="p-0"
      >
        <div className="flex items-start gap-3 border-b border-border-hairline bg-bg-subtle px-6 py-4 text-caption text-text-secondary">
          <Info
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-text-muted"
            strokeWidth={1.5}
          />
          <p>
            About, FAQ, and Contact are part of the shipped design and live in
            the codebase. To edit their content, ask the engineering team. The
            imagery on those pages is already operator-controlled via{' '}
            <Link
              href="/admin/storefront-imagery"
              className="underline underline-offset-4 hover:text-text-primary"
            >
              Storefront Imagery
            </Link>
            .
          </p>
        </div>
        <ul className="divide-y divide-border-hairline">
          {CODE_MANAGED_PAGES.map((p) => (
            <li
              key={p.href}
              className="flex items-center justify-between px-6 py-4"
            >
              <div>
                <p className="text-body font-medium text-text-primary">
                  {p.title}
                </p>
                <p className="text-caption text-text-muted">{p.href}</p>
              </div>
              <Link
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-caption uppercase tracking-[0.12em] text-text-secondary underline underline-offset-4 hover:text-text-primary"
              >
                Preview
              </Link>
            </li>
          ))}
        </ul>
      </AdminSectionCard>
    </AdminScaffoldPage>
  );
}
