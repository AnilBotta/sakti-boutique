import Link from 'next/link';
import { BellRing, Mail, MessageSquare } from 'lucide-react';
import { AdminScaffoldPage } from '@/components/admin/AdminScaffoldPage';

export const metadata = { title: 'Alerts · Sakthi Admin' };

export default function AdminAlertsPage() {
  return (
    <AdminScaffoldPage
      eyebrow="Commerce"
      title="Stock Alerts"
      description="Customers waiting on back-in-stock notifications and similar-piece recommendations."
    >
      <div className="flex flex-col items-center justify-center gap-5 border border-border-hairline bg-bg-canvas px-6 py-20 text-center">
        <div className="flex h-12 w-12 items-center justify-center border border-border-hairline text-text-secondary">
          <BellRing className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div className="max-w-md">
          <h2 className="text-h3 font-medium text-text-primary">
            No subscriptions yet
          </h2>
          <p className="mt-2 text-caption text-text-muted">
            When a customer clicks <em>Notify Me</em> on a sold-out product
            page, their request will appear here. Once you restock the
            variant, the alert can be dispatched.
          </p>
        </div>

        <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 border border-border-hairline bg-bg-subtle px-4 py-4 text-left">
            <BellRing className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-ember" strokeWidth={1.5} />
            <div>
              <p className="text-caption font-medium text-text-primary">
                In-app banner
              </p>
              <p className="mt-1 text-[11px] text-text-muted">
                Returning customers see a banner.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 border border-border-hairline bg-bg-subtle px-4 py-4 text-left">
            <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-text-muted" strokeWidth={1.5} />
            <div>
              <p className="text-caption font-medium text-text-primary">
                Email <span className="text-text-muted">(planned)</span>
              </p>
              <p className="mt-1 text-[11px] text-text-muted">
                Resend / SendGrid integration.
              </p>
            </div>
          </div>
        </div>

        <p className="max-w-md text-[11px] text-text-muted">
          The Notify Me customer flow is coming in the next iteration.
          Storefront PDPs already capture interest in the design — wiring
          submissions to this inbox is the next step.
        </p>

        <Link
          href="/admin"
          className="inline-flex h-9 items-center gap-2 border border-border-default px-4 text-caption font-medium uppercase tracking-[0.12em] text-text-primary hover:bg-bg-subtle"
        >
          <MessageSquare className="h-4 w-4" strokeWidth={1.5} />
          Back to dashboard
        </Link>
      </div>
    </AdminScaffoldPage>
  );
}
