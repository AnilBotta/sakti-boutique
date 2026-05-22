'use client';

import {
  AdminFieldRow,
  AdminInput,
  AdminTextarea,
} from '@/components/admin/form';
import type { EditableProduct } from '@/lib/admin/product-editor';
import { errorFor } from '@/lib/admin/field-errors';
import type { FieldError } from '@/lib/validation/product';

interface SeoFieldsCardProps {
  product: EditableProduct;
  onChange: (patch: Partial<EditableProduct>) => void;
  /**
   * Dedicated SEO patcher injected by ProductEditor. Detects manual slug edits
   * and flips off the auto-sync flag. Falls back to plain onChange if absent
   * (e.g. older callers / tests).
   */
  onSeoChange?: (seoPatch: Partial<EditableProduct['seo']>) => void;
  /** True when the slug is currently being mirrored from the name. */
  slugAutoSynced?: boolean;
  errors?: FieldError[] | null;
}

export function SeoFieldsCard({
  product,
  onChange,
  onSeoChange,
  slugAutoSynced,
  errors,
}: SeoFieldsCardProps) {
  const titleLen = product.seo.metaTitle.length;
  const descLen = product.seo.metaDescription.length;
  const slugError = errorFor(errors, 'seo.slug');
  const titleError = errorFor(errors, 'seo.metaTitle');
  const descError = errorFor(errors, 'seo.metaDescription');

  const setSeo = (patch: Partial<EditableProduct['seo']>) => {
    if (onSeoChange) onSeoChange(patch);
    else onChange({ seo: { ...product.seo, ...patch } });
  };

  return (
    <div className="flex flex-col gap-5">
      <AdminFieldRow
        label="Slug"
        htmlFor="seo-slug"
        error={slugError}
        helper={
          slugAutoSynced
            ? 'Auto-derived from the product name. Edit to override.'
            : 'Used in the product URL: /p/{slug}'
        }
      >
        <AdminInput
          id="seo-slug"
          value={product.seo.slug}
          onChange={(e) =>
            setSeo({
              slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
            })
          }
          prefix="/p/"
          placeholder="aanya-hand-embroidered-kurthi-set"
          invalid={!!slugError}
        />
      </AdminFieldRow>

      <AdminFieldRow
        label="Meta title"
        htmlFor="seo-metaTitle"
        error={titleError}
        helper={titleError ? undefined : `${titleLen} / 60 characters`}
      >
        <AdminInput
          id="seo-metaTitle"
          value={product.seo.metaTitle}
          onChange={(e) => setSeo({ metaTitle: e.target.value })}
          placeholder="Aanya Hand-Embroidered Kurthi Set · Sakthi Trends USA"
          invalid={!!titleError}
        />
      </AdminFieldRow>

      <AdminFieldRow
        label="Meta description"
        htmlFor="seo-metaDescription"
        error={descError}
        helper={descError ? undefined : `${descLen} / 160 characters`}
      >
        <AdminTextarea
          id="seo-metaDescription"
          rows={3}
          value={product.seo.metaDescription}
          onChange={(e) => setSeo({ metaDescription: e.target.value })}
          placeholder="Short, search-friendly summary used in Google results and social sharing previews."
        />
      </AdminFieldRow>

      {/* SERP preview */}
      <div className="border border-border-hairline bg-bg-subtle p-4">
        <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-text-muted">
          Search preview
        </div>
        <div className="text-caption text-text-muted">
          sakthitrendsusa.com › p › {product.seo.slug || '—'}
        </div>
        <div className="mt-1 text-body text-accent-plum">
          {product.seo.metaTitle || 'Meta title preview'}
        </div>
        <p className="mt-1 line-clamp-2 text-caption text-text-secondary">
          {product.seo.metaDescription ||
            'Meta description preview appears here once populated.'}
        </p>
      </div>
    </div>
  );
}
