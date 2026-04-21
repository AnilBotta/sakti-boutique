/**
 * Product editor validation.
 *
 * Hand-rolled validator — intentionally zero-dependency so Step 10A does not
 * introduce new packages. The shape deliberately matches the subset of
 * zod's result API (`{ success, data | errors }`) so a future swap to zod
 * (Step 10B) is a mechanical replacement inside this file only. Call sites
 * do not need to change.
 */

import type { EditableProduct } from '@/lib/admin/product-editor';

export interface FieldError {
  path: string;
  message: string;
}

export type ValidationResult<T> =
  | { success: true; data: T; errors: [] }
  | { success: false; data: null; errors: FieldError[] };

// ---------------------------------------------------------------------------
// Primitive checks
// ---------------------------------------------------------------------------

function req(
  path: string,
  value: unknown,
  msg = 'Required',
): FieldError | null {
  if (value == null || value === '') return { path, message: msg };
  return null;
}

function isSlug(v: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
}

function isNonNegNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0;
}

// ---------------------------------------------------------------------------
// Section validators — exported so callers can validate a single card
// ---------------------------------------------------------------------------

export function validateBasicInfo(p: EditableProduct): FieldError[] {
  const errs: FieldError[] = [];
  const nameErr = req('name', p.name, 'Product name is required');
  if (nameErr) errs.push(nameErr);
  if (p.name && p.name.length > 160)
    errs.push({ path: 'name', message: 'Keep the name under 160 characters' });
  return errs;
}

export function validatePricing(p: EditableProduct): FieldError[] {
  const errs: FieldError[] = [];
  if (!isNonNegNumber(p.price))
    errs.push({ path: 'price', message: 'Price must be a positive number' });
  if (
    p.originalPrice != null &&
    (!isNonNegNumber(p.originalPrice) || p.originalPrice < p.price)
  ) {
    errs.push({
      path: 'originalPrice',
      message: 'Compare-at must be greater than or equal to price',
    });
  }
  return errs;
}

export function validateVariants(p: EditableProduct): FieldError[] {
  const errs: FieldError[] = [];
  if (p.variants.length === 0) {
    errs.push({
      path: 'variants',
      message: 'Add at least one variant before publishing',
    });
    return errs;
  }
  const skus = new Set<string>();
  p.variants.forEach((v, i) => {
    if (!v.sku)
      errs.push({ path: `variants.${i}.sku`, message: 'SKU is required' });
    if (v.sku && skus.has(v.sku))
      errs.push({
        path: `variants.${i}.sku`,
        message: `Duplicate SKU "${v.sku}"`,
      });
    skus.add(v.sku);
    if (!isNonNegNumber(v.stock))
      errs.push({
        path: `variants.${i}.stock`,
        message: 'Stock must be a non-negative number',
      });
    if (!isNonNegNumber(v.price))
      errs.push({
        path: `variants.${i}.price`,
        message: 'Variant price must be a positive number',
      });
    if (
      v.salePrice != null &&
      (!isNonNegNumber(v.salePrice) || v.salePrice > v.price)
    ) {
      errs.push({
        path: `variants.${i}.salePrice`,
        message: 'Sale price must be less than or equal to price',
      });
    }
  });
  return errs;
}

export function validateMedia(p: EditableProduct): FieldError[] {
  const errs: FieldError[] = [];
  if (p.media.length > 0) {
    const covers = p.media.filter((m) => m.isCover).length;
    if (covers !== 1)
      errs.push({
        path: 'media',
        message: 'Select exactly one cover image',
      });
    p.media.forEach((m, i) => {
      if (!m.alt)
        errs.push({
          path: `media.${i}.alt`,
          message: 'Alt text is required for accessibility',
        });
    });
  }
  return errs;
}

export function validateSeo(p: EditableProduct): FieldError[] {
  const errs: FieldError[] = [];
  const slugErr = req('seo.slug', p.seo.slug, 'Slug is required');
  if (slugErr) errs.push(slugErr);
  if (p.seo.slug && !isSlug(p.seo.slug))
    errs.push({
      path: 'seo.slug',
      message: 'Use lowercase letters, numbers, and hyphens only',
    });
  if (p.seo.metaTitle && p.seo.metaTitle.length > 60)
    errs.push({
      path: 'seo.metaTitle',
      message: 'Meta title should be 60 characters or fewer',
    });
  if (p.seo.metaDescription && p.seo.metaDescription.length > 160)
    errs.push({
      path: 'seo.metaDescription',
      message: 'Meta description should be 160 characters or fewer',
    });
  return errs;
}

export function validateChannel(p: EditableProduct): FieldError[] {
  const errs: FieldError[] = [];
  if (p.channel.publishToAmazon && !p.channel.amazonSku) {
    errs.push({
      path: 'channel.amazonSku',
      message: 'Amazon SKU is required when publishing to Amazon',
    });
  }
  return errs;
}

export function validateTryOn(_p: EditableProduct): FieldError[] {
  // Try-on has no hard constraints today; the admin brief only requires
  // the toggle. Hook enforcement lands with provider wiring.
  return [];
}

// ---------------------------------------------------------------------------
// Full payload validation
// ---------------------------------------------------------------------------

export function validateEditableProduct(
  p: EditableProduct,
): ValidationResult<EditableProduct> {
  const errors = [
    ...validateBasicInfo(p),
    ...validatePricing(p),
    ...validateVariants(p),
    ...validateMedia(p),
    ...validateSeo(p),
    ...validateChannel(p),
    ...validateTryOn(p),
  ];
  if (errors.length === 0) {
    return { success: true, data: p, errors: [] };
  }
  return { success: false, data: null, errors };
}
