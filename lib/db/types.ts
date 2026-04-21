/**
 * Database row types.
 *
 * These mirror the `supabase/migrations/0001_init.sql` schema. They are the
 * shape repositories will receive from Supabase once live. For now they're
 * just type definitions — nothing imports a real client.
 *
 * Keep this file in lock-step with the SQL migration. When Step 10B runs
 * `supabase gen types`, the generated types can replace these by hand or
 * be adapted by the mappers in `lib/db/mappers.ts`.
 */

export type DbAudience = 'women' | 'men' | 'kids';
export type DbProductStatus = 'draft' | 'active' | 'archived';
export type DbOrderStatus =
  | 'pending'
  | 'paid'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';
export type DbReviewStatus = 'pending' | 'approved' | 'rejected' | 'hidden';
export type DbAmazonListingStatus =
  | 'draft'
  | 'pending'
  | 'listed'
  | 'error'
  | 'suppressed';
export type DbTryonJobStatus =
  | 'queued'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled';

export interface DbCategory {
  id: string;
  parent_id: string | null;
  audience: DbAudience | null;
  slug: string;
  label: string;
  position: number;
  banner_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  fabric: string | null;
  care: string | null;
  audience: DbAudience;
  category_id: string | null;
  subcategory_id: string | null;
  price: number;
  original_price: number | null;
  status: DbProductStatus;
  featured: boolean;
  best_seller: boolean;
  new_arrival: boolean;
  try_on_enabled: boolean;
  total_stock: number;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbProductVariant {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  sku: string;
  stock: number;
  price: number;
  sale_price: number | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface DbProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  url: string | null;
  alt: string | null;
  is_cover: boolean;
  position: number;
  width: number | null;
  height: number | null;
  created_at: string;
}

export interface DbProductAttribute {
  id: string;
  product_id: string;
  key: string;
  value: string;
  position: number;
}

export interface DbChannelMapping {
  id: string;
  product_id: string;
  channel: string;
  publish: boolean;
  external_sku: string | null;
  external_id: string | null;
  listing_status: DbAmazonListingStatus;
  last_sync_at: string | null;
  last_sync_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbCustomer {
  id: string;
  auth_user_id: string | null;
  email: string;
  full_name: string | null;
  phone: string | null;
  lifetime_value: number;
  order_count: number;
  created_at: string;
  updated_at: string;
}

export interface DbOrder {
  id: string;
  number: string;
  customer_id: string | null;
  status: DbOrderStatus;
  channel: string;
  currency: string;
  subtotal: number;
  shipping_total: number;
  tax_total: number;
  discount_total: number;
  grand_total: number;
  shipping_address_id: string | null;
  billing_address_id: string | null;
  payment_provider: string | null;
  payment_ref: string | null;
  placed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  name_snapshot: string;
  variant_label_snapshot: string | null;
  sku_snapshot: string;
  price_snapshot: number;
  quantity: number;
  image_url_snapshot: string | null;
}

export interface DbReview {
  id: string;
  product_id: string;
  customer_id: string | null;
  author_name: string;
  rating: number;
  title: string | null;
  body: string;
  status: DbReviewStatus;
  submitted_at: string;
  moderated_at: string | null;
}

export interface DbContentPage {
  id: string;
  slug: string;
  title: string;
  status: 'draft' | 'published';
  body: Record<string, unknown>;
  meta_title: string | null;
  meta_description: string | null;
  updated_at: string;
}

export interface DbTryonJob {
  id: string;
  customer_id: string | null;
  product_id: string;
  variant_id: string | null;
  status: DbTryonJobStatus;
  provider: string | null;
  provider_job_id: string | null;
  source_image_path: string | null;
  result_image_path: string | null;
  error_message: string | null;
  latency_ms: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Joined shape returned by catalog queries (one product + its variants,
 * images, attributes, and channel mapping). Keeps repositories honest about
 * what they load vs. what components need.
 */
export interface DbProductFull {
  product: DbProduct;
  variants: DbProductVariant[];
  images: DbProductImage[];
  attributes: DbProductAttribute[];
  channelMappings: DbChannelMapping[];
}
