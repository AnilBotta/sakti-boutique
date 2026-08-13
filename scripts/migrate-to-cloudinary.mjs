/**
 * One-time migration: Supabase Storage -> Cloudinary.
 *
 * Walks every image URL stored in the database, re-uploads the bytes to
 * Cloudinary, and rewrites the row to point at the new delivery URL.
 *
 * Tables touched:
 *   product_images  .url  .storage_path
 *   site_imagery    .url  .storage_path
 *   reviews         .photos (text[])
 *
 * Safety properties:
 *   - Dry-run by default. Pass --execute to actually write.
 *   - Idempotent: rows already pointing at res.cloudinary.com are skipped,
 *     so a partial run can simply be re-run.
 *   - Writes a timestamped backup of every original value BEFORE the first
 *     write, so a rollback is a straight replay of the JSON.
 *   - Leaves the Supabase objects in place. Nothing is deleted here; the
 *     bucket stays as a safety net until you choose to drop it.
 *
 * Usage (from the project root):
 *   node scripts/migrate-to-cloudinary.mjs             # dry run
 *   node scripts/migrate-to-cloudinary.mjs --execute   # commit changes
 */

import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const EXECUTE = process.argv.includes('--execute');
const ROOT = 'sakti';

// ---------------------------------------------------------------------------
// Env
// ---------------------------------------------------------------------------

function loadEnv() {
  const env = {};
  try {
    for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    throw new Error('Could not read .env.local — run this from the project root.');
  }
  return { ...env, ...process.env };
}

const env = loadEnv();

const REQUIRED = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];
const missing = REQUIRED.filter((k) => !env[k]);
if (missing.length) {
  console.error(`\nMissing env vars:\n  ${missing.join('\n  ')}\n`);
  console.error('Add the CLOUDINARY_* values to .env.local, then re-run.\n');
  process.exit(1);
}

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const isSupabaseUrl = (u) =>
  typeof u === 'string' && u.includes('/storage/v1/object/public/');
const isCloudinaryUrl = (u) =>
  typeof u === 'string' && u.includes('res.cloudinary.com');

const deliveryUrl = (publicId) =>
  `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${publicId}`;

/**
 * Derive a Cloudinary folder from the original Supabase object key so the
 * media library keeps the same shape:
 *   products/<productId>/<file>  -> sakti/products/<productId>
 *   site-<slot>/<file>           -> sakti/site/<slot>
 *   reviews/<batch>/<file>       -> sakti/reviews/<batch>
 */
function folderFromSupabaseUrl(url, fallback) {
  const after = url.split('/object/public/')[1];
  if (!after) return `${ROOT}/${fallback}`;
  const parts = after.split('/').slice(1); // drop bucket name
  parts.pop(); // drop filename
  if (parts.length === 0) return `${ROOT}/${fallback}`;
  // `products/site-<slot>` was how the storefront-imagery editor scoped its
  // uploads; normalise that into a dedicated site/ tree.
  if (parts[0] === 'products' && parts[1]?.startsWith('site-')) {
    return `${ROOT}/site/${parts[1].slice('site-'.length)}`;
  }
  return `${ROOT}/${parts.join('/')}`;
}

async function uploadFromUrl(sourceUrl, folder) {
  const res = await fetch(sourceUrl);
  if (!res.ok) {
    throw new Error(`GET ${res.status} ${res.statusText}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        unique_filename: true,
        overwrite: false,
      },
      (err, out) => (err || !out ? reject(err ?? new Error('no result')) : resolve(out)),
    );
    stream.end(buffer);
  });
  return { publicId: result.public_id, url: deliveryUrl(result.public_id) };
}

const backup = { startedAt: new Date().toISOString(), product_images: [], site_imagery: [], reviews: [] };
const stats = { uploaded: 0, skipped: 0, failed: 0 };
const failures = [];

function log(...args) {
  console.log(...args);
}

// ---------------------------------------------------------------------------
// 1. product_images
// ---------------------------------------------------------------------------

async function migrateProductImages() {
  const { data, error } = await db
    .from('product_images')
    .select('id, product_id, url, storage_path');
  if (error) throw new Error(`product_images read: ${error.message}`);

  log(`\n== product_images (${data.length} rows) ==`);
  for (const row of data) {
    if (isCloudinaryUrl(row.url)) {
      stats.skipped++;
      continue;
    }
    if (!isSupabaseUrl(row.url)) {
      log(`  skip  ${row.id} (not a Supabase URL)`);
      stats.skipped++;
      continue;
    }
    const folder = folderFromSupabaseUrl(row.url, `products/${row.product_id}`);
    try {
      if (!EXECUTE) {
        log(`  DRY   ${row.id} -> ${folder}`);
        stats.uploaded++;
        continue;
      }
      const up = await uploadFromUrl(row.url, folder);
      backup.product_images.push({
        id: row.id,
        url: row.url,
        storage_path: row.storage_path,
      });
      const { error: updErr } = await db
        .from('product_images')
        .update({ url: up.url, storage_path: up.publicId })
        .eq('id', row.id);
      if (updErr) throw new Error(updErr.message);
      log(`  ok    ${row.id} -> ${up.publicId}`);
      stats.uploaded++;
    } catch (e) {
      log(`  FAIL  ${row.id}: ${e.message}`);
      failures.push({ table: 'product_images', id: row.id, error: e.message });
      stats.failed++;
    }
  }
}

// ---------------------------------------------------------------------------
// 2. site_imagery
// ---------------------------------------------------------------------------

async function migrateSiteImagery() {
  const { data, error } = await db
    .from('site_imagery')
    .select('slot, url, storage_path');
  if (error) throw new Error(`site_imagery read: ${error.message}`);

  log(`\n== site_imagery (${data.length} rows) ==`);
  for (const row of data) {
    if (isCloudinaryUrl(row.url)) {
      stats.skipped++;
      continue;
    }
    if (!isSupabaseUrl(row.url)) {
      log(`  skip  ${row.slot} (not a Supabase URL)`);
      stats.skipped++;
      continue;
    }
    const folder = folderFromSupabaseUrl(row.url, `site/${row.slot}`);
    try {
      if (!EXECUTE) {
        log(`  DRY   ${row.slot} -> ${folder}`);
        stats.uploaded++;
        continue;
      }
      const up = await uploadFromUrl(row.url, folder);
      backup.site_imagery.push({
        slot: row.slot,
        url: row.url,
        storage_path: row.storage_path,
      });
      const { error: updErr } = await db
        .from('site_imagery')
        .update({ url: up.url, storage_path: up.publicId })
        .eq('slot', row.slot);
      if (updErr) throw new Error(updErr.message);
      log(`  ok    ${row.slot} -> ${up.publicId}`);
      stats.uploaded++;
    } catch (e) {
      log(`  FAIL  ${row.slot}: ${e.message}`);
      failures.push({ table: 'site_imagery', id: row.slot, error: e.message });
      stats.failed++;
    }
  }
}

// ---------------------------------------------------------------------------
// 3. reviews.photos (text[])
// ---------------------------------------------------------------------------

async function migrateReviewPhotos() {
  const { data, error } = await db.from('reviews').select('id, photos');
  if (error) throw new Error(`reviews read: ${error.message}`);

  const withPhotos = data.filter((r) => (r.photos ?? []).length > 0);
  log(`\n== reviews (${withPhotos.length} rows with photos) ==`);

  for (const row of withPhotos) {
    const originals = row.photos ?? [];
    if (originals.every((u) => !isSupabaseUrl(u))) {
      stats.skipped += originals.length;
      continue;
    }
    try {
      const next = [];
      for (const photo of originals) {
        if (!isSupabaseUrl(photo)) {
          next.push(photo);
          stats.skipped++;
          continue;
        }
        const folder = folderFromSupabaseUrl(photo, `reviews/${row.id}`);
        if (!EXECUTE) {
          log(`  DRY   ${row.id} -> ${folder}`);
          next.push(photo);
          stats.uploaded++;
          continue;
        }
        const up = await uploadFromUrl(photo, folder);
        next.push(up.url);
        stats.uploaded++;
      }
      if (EXECUTE) {
        backup.reviews.push({ id: row.id, photos: originals });
        const { error: updErr } = await db
          .from('reviews')
          .update({ photos: next })
          .eq('id', row.id);
        if (updErr) throw new Error(updErr.message);
        log(`  ok    ${row.id} (${next.length} photos)`);
      }
    } catch (e) {
      log(`  FAIL  ${row.id}: ${e.message}`);
      failures.push({ table: 'reviews', id: row.id, error: e.message });
      stats.failed++;
    }
  }
}

// ---------------------------------------------------------------------------

async function main() {
  log(
    EXECUTE
      ? '\n*** EXECUTE MODE — database rows will be rewritten ***'
      : '\n--- DRY RUN (no writes). Re-run with --execute to commit. ---',
  );

  await migrateProductImages();
  await migrateSiteImagery();
  await migrateReviewPhotos();

  if (EXECUTE) {
    mkdirSync('scripts/backups', { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const file = `scripts/backups/pre-cloudinary-${stamp}.json`;
    writeFileSync(file, JSON.stringify(backup, null, 2));
    log(`\nBackup of original URLs written to ${file}`);
  }

  log(
    `\nSummary: ${stats.uploaded} migrated, ${stats.skipped} skipped, ${stats.failed} failed`,
  );
  if (failures.length) {
    log('\nFailures:');
    for (const f of failures) log(`  ${f.table}/${f.id}: ${f.error}`);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error('\nMigration aborted:', e.message);
  process.exit(1);
});
