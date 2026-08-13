/**
 * Read-only image host audit.
 *
 * Reports where every stored image URL currently points. Run it before a
 * migration to size the work, and after to confirm the cutover is complete.
 *
 * Usage (from the project root):
 *   node scripts/audit-images.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = {};
try {
  for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {
  console.error('Could not read .env.local — run this from the project root.');
  process.exit(1);
}

const db = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const host = (u) => {
  if (typeof u !== 'string' || !u) return 'empty';
  if (u.includes('/storage/v1/object/public/')) return 'supabase';
  if (u.includes('res.cloudinary.com')) return 'cloudinary';
  if (u.includes('images.unsplash.com')) return 'unsplash';
  return 'other';
};

const tally = (urls) =>
  urls.reduce((acc, u) => {
    const k = host(u);
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

const out = {};

const { data: pi, error: piErr } = await db
  .from('product_images')
  .select('id, url');
out.product_images = piErr
  ? { error: piErr.message }
  : { total: pi.length, byHost: tally(pi.map((r) => r.url)) };

const { data: si, error: siErr } = await db
  .from('site_imagery')
  .select('slot, url');
out.site_imagery = siErr
  ? { error: siErr.message }
  : {
      total: si.length,
      byHost: tally(si.map((r) => r.url)),
      stillOnSupabase: si
        .filter((r) => host(r.url) === 'supabase')
        .map((r) => r.slot),
    };

const { data: rv, error: rvErr } = await db.from('reviews').select('id, photos');
out.reviews = rvErr
  ? { error: rvErr.message }
  : (() => {
      const photos = rv.flatMap((r) => r.photos ?? []);
      return { rows: rv.length, totalPhotos: photos.length, byHost: tally(photos) };
    })();

const allHosts = [
  ...(pi ?? []).map((r) => r.url),
  ...(si ?? []).map((r) => r.url),
  ...(rv ?? []).flatMap((r) => r.photos ?? []),
];
out.TOTAL = tally(allHosts);

console.log(JSON.stringify(out, null, 2));
