/**
 * Show the most recently created product images and where they are hosted.
 * Useful for confirming a live upload landed on the expected CDN.
 *
 * Usage:  node scripts/check-recent-uploads.mjs [limit]
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = {};
for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const db = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const limit = Number(process.argv[2] ?? 10);

const host = (u) => {
  if (typeof u !== 'string' || !u) return 'EMPTY';
  if (u.includes('res.cloudinary.com')) return 'CLOUDINARY';
  if (u.includes('/storage/v1/object/public/')) return 'SUPABASE';
  return 'other';
};

const { data: imgs, error } = await db
  .from('product_images')
  .select('id, product_id, url, storage_path, created_at')
  .order('created_at', { ascending: false })
  .limit(limit);
if (error) throw new Error(error.message);

// Resolve product names for readability.
const ids = [...new Set(imgs.map((i) => i.product_id))];
const { data: prods } = await db
  .from('products')
  .select('id, name, created_at')
  .in('id', ids);
const nameById = new Map((prods ?? []).map((p) => [p.id, p.name]));

console.log(`\nMost recent ${imgs.length} product images:\n`);
for (const i of imgs) {
  console.log(
    `${i.created_at}  ${host(i.url).padEnd(10)}  ${nameById.get(i.product_id) ?? i.product_id}`,
  );
  console.log(`    storage_path: ${i.storage_path}`);
}

// Newest products overall, so a product uploaded without images still shows.
const { data: newestProds } = await db
  .from('products')
  .select('id, name, slug, status, created_at')
  .order('created_at', { ascending: false })
  .limit(3);
console.log(`\nNewest products:\n`);
for (const p of newestProds ?? []) {
  const count = imgs.filter((i) => i.product_id === p.id).length;
  console.log(
    `${p.created_at}  ${p.status.padEnd(8)}  ${p.name}  (${count} of the recent images above)`,
  );
}
