import { AdminScaffoldPage } from '@/components/admin/AdminScaffoldPage';
import { getMaskedIntegration } from '@/lib/repositories/integration-settings';
import { isEncryptionConfigured } from '@/lib/crypto/secrets';
import { isSupabaseAdminConfigured } from '@/lib/supabase/env';
import { IntegrationsClient } from './IntegrationsClient';

// The route is gated by middleware (/admin/*); the page only reads masked,
// secret-free hints. Every secret-touching Server Action re-checks
// `requireAdmin()` itself, which is where the real enforcement lives.
export default async function AdminIntegrationsPage() {
  const [stripe, usps] = await Promise.all([
    getMaskedIntegration('stripe'),
    getMaskedIntegration('usps'),
  ]);

  const ready = isSupabaseAdminConfigured() && isEncryptionConfigured();

  return (
    <AdminScaffoldPage
      eyebrow="System"
      title="Integrations"
      description="Connect your own Stripe and USPS accounts. Keys are encrypted at rest, kept server-side, and never shown in full — only the last four characters are displayed."
    >
      <IntegrationsClient stripe={stripe} usps={usps} ready={ready} />
    </AdminScaffoldPage>
  );
}
