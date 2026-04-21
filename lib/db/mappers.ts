/**
 * DB ↔ UI mappers.
 *
 * Components and route handlers must NEVER consume raw `Db*` rows directly.
 * They consume one of the shapes already used by the storefront/admin:
 *
 *   - `Product`        — catalog card / PDP shape    (lib/catalog/products.ts)
 *   - `EditableProduct` — admin editor shape         (lib/admin/product-editor.ts)
 *
 * This file is the single place where the conversion happens. When Step 10B
 * replaces placeholder data with real Supabase queries, repositories will
 * return `DbProductFull` and call `dbProductToStorefront` / `dbProductToEditable`
 * here — no component changes required.
 */

import type { Product, Badge } from '@/lib/catalog/products';
import type {
  EditableProduct,
  EditableVariant,
  EditableMedia,
  EditableSeo,
  EditableFlags,
  EditableChannel,
  ProductStatus,
} from '@/lib/admin/product-editor';
import type {
  DbProduct,
  DbProductFull,
  DbProductVariant,
  DbProductImage,
  DbChannelMapping,
  DbAmazonListingStatus,
} from './types';

// ---------------------------------------------------------------------------
// DB → Storefront `Product`
// ---------------------------------------------------------------------------

function pickBadge(p: DbProduct): Badge | undefined {
  if (p.best_seller) return 'Best Seller';
  if (p.new_arrival) return 'New';
  if (p.featured) return 'Festive';
  return undefined;
}

export function dbProductToStorefront(full: DbProductFull): Product {
  const { product, variants, images, attributes } = full;
  const cover =
    images.find((i) => i.is_cover) ??
    images.slice().sort((a, b) => a.position - b.position)[0];

  const sizes = uniq(variants.map((v) => v.size).filter(nonNull));
  const colors = uniq(variants.map((v) => v.color).filter(nonNull));
  const occasion = attributes
    .filter((a) => a.key === 'occasion')
    .map((a) => a.value);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    audience: product.audience,
    category: lookupCategorySlug(product.category_id, full),
    subcategory: lookupCategorySlug(product.subcategory_id, full),
    price: Number(product.price),
    originalPrice:
      product.original_price != null ? Number(product.original_price) : undefined,
    badge: pickBadge(product),
    image: cover?.url ?? '',
    sizes,
    colors,
    fabric: product.fabric ?? '',
    occasion,
    inStock: product.in_stock,
    createdAt: product.created_at,
  };
}

/**
 * Category slug resolution is a placeholder — repositories currently JOIN
 * categories in when loading a product and can pass the slug through the
 * `attributes` array or as a separate field. Step 10B will replace this with
 * a real join result on `DbProductFull`.
 */
function lookupCategorySlug(
  _id: string | null,
  _full: DbProductFull,
): string {
  return '';
}

// ---------------------------------------------------------------------------
// DB → Admin `EditableProduct`
// ---------------------------------------------------------------------------

function dbVariantToEditable(v: DbProductVariant): EditableVariant {
  return {
    uid: v.id,
    size: v.size ?? '',
    color: v.color ?? '',
    sku: v.sku,
    stock: v.stock,
    price: Number(v.price),
    salePrice: v.sale_price != null ? Number(v.sale_price) : null,
  };
}

function dbImageToEditable(img: DbProductImage): EditableMedia {
  return {
    uid: img.id,
    url: img.url ?? '',
    alt: img.alt ?? '',
    isCover: img.is_cover,
  };
}

function dbChannelToEditable(
  map: DbChannelMapping | undefined,
): EditableChannel {
  if (!map) {
    return {
      publishToAmazon: false,
      amazonSku: '',
      asin: '',
      listingStatus: 'draft',
      lastSyncAt: null,
      lastSyncError: null,
    };
  }
  return {
    publishToAmazon: map.publish,
    amazonSku: map.external_sku ?? '',
    asin: map.external_id ?? '',
    listingStatus: map.listing_status,
    lastSyncAt: map.last_sync_at,
    lastSyncError: map.last_sync_error,
  };
}

export function dbProductToEditable(full: DbProductFull): EditableProduct {
  const { product, variants, images, channelMappings } = full;
  const amazon = channelMappings.find((m) => m.channel === 'amazon');

  const seo: EditableSeo = {
    slug: product.slug,
    metaTitle: '',
    metaDescription: '',
  };
  const flags: EditableFlags = {
    featured: product.featured,
    bestSeller: product.best_seller,
    newArrival: product.new_arrival,
    tryOnEnabled: product.try_on_enabled,
  };

  return {
    id: product.id,
    status: product.status as ProductStatus,
    name: product.name,
    description: product.description ?? '',
    fabric: product.fabric ?? '',
    care: product.care ?? '',
    audience: product.audience,
    category: '',      // resolved from joined category row in Step 10B
    subcategory: undefined,
    price: Number(product.price),
    originalPrice:
      product.original_price != null ? Number(product.original_price) : null,
    variants: variants
      .slice()
      .sort((a, b) => a.position - b.position)
      .map(dbVariantToEditable),
    media: images
      .slice()
      .sort((a, b) => a.position - b.position)
      .map(dbImageToEditable),
    seo,
    flags,
    channel: dbChannelToEditable(amazon),
  };
}

// ---------------------------------------------------------------------------
// Admin `EditableProduct` → DB insert/update payload
// ---------------------------------------------------------------------------

export interface ProductWritePayload {
  product: Omit<DbProduct, 'id' | 'created_at' | 'updated_at' | 'total_stock' | 'in_stock'> & {
    id?: string;
  };
  variants: Array<
    Omit<DbProductVariant, 'id' | 'product_id' | 'created_at' | 'updated_at'> & {
      id?: string;
    }
  >;
  images: Array<
    Omit<DbProductImage, 'id' | 'product_id' | 'created_at' | 'url'> & {
      id?: string;
    }
  >;
  channel: {
    publish: boolean;
    external_sku: string | null;
    external_id: string | null;
    listing_status: DbAmazonListingStatus;
  };
}

export function editableToWritePayload(p: EditableProduct): ProductWritePayload {
  return {
    product: {
      slug: p.seo.slug,
      name: p.name,
      description: p.description || null,
      fabric: p.fabric || null,
      care: p.care || null,
      audience: p.audience,
      category_id: null,        // resolved from `p.category` at save time
      subcategory_id: null,     // resolved from `p.subcategory` at save time
      price: p.price,
      original_price: p.originalPrice ?? null,
      status: p.status,
      featured: p.flags.featured,
      best_seller: p.flags.bestSeller,
      new_arrival: p.flags.newArrival,
      try_on_enabled: p.flags.tryOnEnabled,
    },
    variants: p.variants.map((v, i) => ({
      size: v.size || null,
      color: v.color || null,
      sku: v.sku,
      stock: v.stock,
      price: v.price,
      sale_price: v.salePrice ?? null,
      position: i,
    })),
    images: p.media.map((m, i) => ({
      storage_path: m.url,       // real storage path resolved after upload
      alt: m.alt || null,
      is_cover: m.isCover,
      position: i,
      width: null,
      height: null,
    })),
    channel: {
      publish: p.channel.publishToAmazon,
      external_sku: p.channel.amazonSku || null,
      external_id: p.channel.asin || null,
      listing_status: p.channel.listingStatus,
    },
  };
}

// ---------------------------------------------------------------------------
// Tiny helpers
// ---------------------------------------------------------------------------

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function nonNull<T>(v: T | null | undefined): v is T {
  return v != null;
}
