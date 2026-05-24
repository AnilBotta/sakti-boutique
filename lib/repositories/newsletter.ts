/**
 * Newsletter subscribers — admin reads.
 *
 * Public submission goes through `lib/actions/storefront-newsletter.ts`
 * (which writes via the anon client, gated by the
 * `public can subscribe to newsletter` RLS policy from migration 0010).
 */

import 'server-only';

import {
  isSupabaseConfigured,
  warnOncePlaceholderMode,
} from '@/lib/supabase/env';
import { getAdminSupabase, getServerSupabase } from '@/lib/supabase/server';

export type SubscriberStatus = 'active' | 'unsubscribed';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  source: string;
  status: SubscriberStatus;
  subscribedAt: string;
  unsubscribedAt: string | null;
}

export interface NewsletterStats {
  active: number;
  unsubscribed: number;
  total: number;
}

interface DbSubscriberRow {
  id: string;
  email: string;
  source: string;
  status: SubscriberStatus;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

function toSubscriber(row: DbSubscriberRow): NewsletterSubscriber {
  return {
    id: row.id,
    email: row.email,
    source: row.source,
    status: row.status,
    subscribedAt: row.subscribed_at,
    unsubscribedAt: row.unsubscribed_at,
  };
}

export async function listSubscribers(
  limit = 500,
): Promise<NewsletterSubscriber[]> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('newsletter.list');
    return [];
  }
  const db = getAdminSupabase() ?? getServerSupabase();
  if (!db) return [];

  const { data, error } = await db
    .from('newsletter_subscribers')
    .select('id, email, source, status, subscribed_at, unsubscribed_at')
    .order('subscribed_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('[newsletter.list]', error.message);
    return [];
  }
  return ((data ?? []) as unknown as DbSubscriberRow[]).map(toSubscriber);
}

export async function getNewsletterStats(): Promise<NewsletterStats> {
  const empty: NewsletterStats = { active: 0, unsubscribed: 0, total: 0 };
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('newsletter.stats');
    return empty;
  }
  const db = getAdminSupabase() ?? getServerSupabase();
  if (!db) return empty;

  const [activeRes, totalRes] = await Promise.all([
    db
      .from('newsletter_subscribers')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
    db
      .from('newsletter_subscribers')
      .select('id', { count: 'exact', head: true }),
  ]);

  const active = activeRes.count ?? 0;
  const total = totalRes.count ?? 0;
  return { active, total, unsubscribed: total - active };
}
