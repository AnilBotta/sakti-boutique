import { AdminScaffoldPage } from '@/components/admin/AdminScaffoldPage';
import { AdminSectionCard } from '@/components/admin/AdminSectionCard';
import { AdminTable, type AdminColumn } from '@/components/admin/AdminTable';
import { KpiCard } from '@/components/admin/dashboard/KpiCard';
import {
  listSubscribers,
  getNewsletterStats,
  type NewsletterSubscriber,
} from '@/lib/repositories/newsletter';
import { ExportSubscribersButton } from './ExportSubscribersButton';

export const dynamic = 'force-dynamic';

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const cols: AdminColumn<NewsletterSubscriber>[] = [
  {
    key: 'email',
    header: 'Email',
    primary: true,
    cell: (r) => (
      <span className="font-medium text-text-primary">{r.email}</span>
    ),
  },
  {
    key: 'source',
    header: 'Source',
    hideOn: 'sm',
    cell: (r) => <span className="text-text-muted">{r.source}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    cell: (r) => (
      <span
        className={
          r.status === 'active'
            ? 'inline-flex items-center gap-1.5 text-caption text-state-success'
            : 'inline-flex items-center gap-1.5 text-caption text-text-muted'
        }
      >
        <span
          className={
            r.status === 'active'
              ? 'h-1.5 w-1.5 rounded-full bg-state-success'
              : 'h-1.5 w-1.5 rounded-full bg-text-muted'
          }
        />
        {r.status === 'active' ? 'Active' : 'Unsubscribed'}
      </span>
    ),
  },
  {
    key: 'subscribed',
    header: 'Subscribed',
    hideOn: 'md',
    align: 'right',
    cell: (r) => (
      <span className="text-text-muted nums-tabular">
        {formatDate(r.subscribedAt)}
      </span>
    ),
  },
];

export default async function AdminSubscribersPage() {
  const [stats, subscribers] = await Promise.all([
    getNewsletterStats(),
    listSubscribers(500),
  ]);
  const activeSubscribers = subscribers.filter((s) => s.status === 'active');

  return (
    <AdminScaffoldPage
      eyebrow="Commerce"
      title="Subscribers"
      description="Emails captured from the storefront newsletter form. Export the list to send a campaign via Mailchimp, SendGrid, Resend, etc."
      actions={
        <ExportSubscribersButton
          subscribers={activeSubscribers}
          disabled={activeSubscribers.length === 0}
        />
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Active subscribers"
          value={stats.active}
          helper={stats.active === 0 ? 'no sign-ups yet' : 'opted in'}
        />
        <KpiCard
          label="Unsubscribed"
          value={stats.unsubscribed}
          helper={stats.unsubscribed === 0 ? 'none' : 'opted out'}
        />
        <KpiCard
          label="Total ever"
          value={stats.total}
          helper="all-time sign-ups"
        />
      </div>

      <AdminSectionCard
        title="All subscribers"
        description={
          subscribers.length === 0
            ? undefined
            : `${subscribers.length} ${subscribers.length === 1 ? 'row' : 'rows'}`
        }
        bodyClassName={subscribers.length === 0 ? 'p-0' : undefined}
      >
        {subscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
            <p className="text-body text-text-secondary">No subscribers yet.</p>
            <p className="max-w-md text-caption text-text-muted">
              Sign-ups from the homepage{' '}
              <span className="italic">Letters from the atelier</span> block
              will appear here as soon as the first visitor subscribes.
            </p>
          </div>
        ) : (
          <AdminTable
            columns={cols}
            rows={subscribers}
            rowKey={(r) => r.id}
          />
        )}
      </AdminSectionCard>
    </AdminScaffoldPage>
  );
}
