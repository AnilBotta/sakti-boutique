import { AdminScaffoldPage } from '@/components/admin/AdminScaffoldPage';
import { AdminSectionCard } from '@/components/admin/AdminSectionCard';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { tryOnSummary } from '@/lib/admin/mock-data';

export default function AdminTryOnPage() {
  const pct = (n: number) => `${(n * 100).toFixed(0)}%`;

  return (
    <AdminScaffoldPage
      eyebrow="Experiences"
      title="Virtual Try-On"
      description="Monitor Try Me job health, success rates, and per-product eligibility."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Jobs · Today" value={tryOnSummary.jobsToday} />
        <AdminStatCard label="Success rate" value={pct(tryOnSummary.successRate)} helper="last 24h" />
        <AdminStatCard label="Avg latency" value={`${(tryOnSummary.avgLatencyMs / 1000).toFixed(1)}s`} />
        <AdminStatCard label="Enabled products" value={tryOnSummary.enabledProducts} />
      </div>

      <AdminSectionCard title="Recent Jobs" description="Live job queue will stream here once the provider is wired">
        <AdminEmptyState
          title="Provider not yet connected"
          description="Job monitoring activates once the Try-On orchestration layer is live. The UI and schema are ready."
        />
      </AdminSectionCard>
    </AdminScaffoldPage>
  );
}
