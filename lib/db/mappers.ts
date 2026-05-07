/**
 * DB ↔ UI mappers.
 *
 * Components and route handlers must NEVER consume raw `Db*` rows directly.
 * They consume one of the shapes already used by the storefront/admin:
 *
 *   - `Product`        — catalog card / PDP shape    (lib/catalog/products.ts)
 *   - `EditableProduct` — admin editor shape         (lib/admin/product-editor.ts)
 *
 * This file is the single place where the conversion happens.
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
  const variants = full.variants ?? [];
  const images = full.images ?? [];
  const attributes = full.attributes ?? [];

  const cover =
    images.find((i) => i.is_cover) ??
    images.slice().sort((a, b) => a.position - b.position)[0];

  const sizes = uniq(variants.map((v) => v.size).filter(nonNull));
  const colors = uniq(variants.map((v) => v.color).filter(nonNull));
  const occasion = attributes
    .filter((a) => a.key === 'occasion')
    .map((a) => a.value);

  return {
    id: full.id,
    slug: full.slug,
    name: full.name,
    audience: full.audience,
    category: full.category?.slug ?? '',
    subcategory: full.subcategory?.slug,
    price: Number(full.price),
    originalPrice:
      full.original_price != null ? Number(full.original_price) : undefined,
    badge: pickBadge(full),
    image: cover?.url ?? '',
    sizes,
    colors,
    fabric: full.fabric ?? '',
    occasion,
    inStock: full.in_stock,
    createdAt: full.created_at,
  };
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
  const variants = full.variants ?? [];
  const images = full.images ?? [];
  const channelMappings = full.channel_mappings ?? [];
  const amazon = channelMappings.find((m) => m.channel === 'amazon');

  const seo: EditableSeo = {
    slug: full.slug,
    metaTitle: '',
    metaDescription: '',
  };
  const flags: EditableFlags = {
    featured: full.featured,
    bestSeller: full.best_seller,
    newArrival: full.new_arrival,
    tryOnEnabled: full.try_on_enabled,
  };

  return {
    id: full.id,
    status: full.status as ProductStatus,
    name: full.name,
    description: full.description ?? '',
    fabric: full.fabric ?? '',
    care: full.care ?? '',
    audience: full.audience,
    category: full.category?.slug ?? '',
    subcategory: full.subcategory?.slug,
    price: Number(full.price),
    originalPrice:
      full.original_price != null ? Number(full.original_price) : null,
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
// Admin `EditableProduct` → DB insert/update payload (consumed by the
// `save_product_full` Postgres RPC).
// ---------------------------------------------------------------------------

export interface ProductWritePayload {
  product: {
    id?: string;
    slug: string;
    name: string;
    description: string | null;
    fabric: string | null;
    care: string | null;
    audience: 'women' | 'men' | 'kids';
    /** Slug, resolved to category_id inside the RPC. */
    category_slug: string;
    /** Slug, resolved to subcategory_id inside the RPC. */
    subcategory_slug: string | null;
    price: number;
    original_price: number | null;
    status: 'draft' | 'active' | 'archived';
    featured: boolean;
    best_seller: boolean;
    new_arrival: boolean;
    try_on_enabled: boolean;
  };
  variants: Array<
    Omit<DbProductVariant, 'id' | 'product_id' | 'created_at' | 'updated_at'> & {
      id?: string;
    }
  >;
  images: Array<
    Omit<DbProductImage, 'id' | 'product_id' | 'created_at' | 'url'> & {
      id?: string;
      url?: string | null;
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
      id: p.id || undefined,
      slug: p.seo.slug,
      name: p.name,
      description: p.description || null,
      fabric: p.fabric || null,
      care: p.care || null,
      audience: p.audience,
      category_slug: p.category,
      subcategory_slug: p.subcategory ?? null,
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
      // For external/seeded media, `m.url` is a real URL we keep as-is.
      // For freshly uploaded media, the upload flow stamps storage_path on `m.url`
      // before save — until the upload pipeline lands, store the URL as the path.
      storage_path: m.url,
      url: m.url || null,
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
