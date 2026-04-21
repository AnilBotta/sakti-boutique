'use client';

import {
  AdminFieldRow,
  AdminInput,
  AdminTextarea,
} from '@/components/admin/form';
import type { EditableProduct } from '@/lib/admin/product-editor';

interface SeoFieldsCardProps {
  product: EditableProduct;
  onChange: (patch: Partial<EditableProduct>) => void;
}

export function SeoFieldsCard({ product, onChange }: SeoFieldsCardProps) {
  const titleLen = product.seo.metaTitle.length;
  const descLen = product.seo.metaDescription.length;

  const setSeo = (patch: Partial<EditableProduct['seo']>) =>
    onChange({ seo: { ...product.seo, ...patch } });

  return (
    <div className="flex flex-col gap-5">
      <AdminFieldRow
        label="Slug"
        htmlFor="seo-slug"
        helper="Used in the product URL: /p/{slug}"
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
        />
      </AdminFieldRow>

      <AdminFieldRow
        label="Meta title"
        htmlFor="seo-metaTitle"
        helper={`${titleLen} / 60 characters`}
      >
        <AdminInput
          id="seo-metaTitle"
          value={product.seo.metaTitle}
          onChange={(e) => setSeo({ metaTitle: e.target.value })}
          placeholder="Aanya Hand-Embroidered Kurthi Set · Sakthi Trends USA"
        />
      </AdminFieldRow>

      <AdminFieldRow
        label="Meta description"
        htmlFor="seo-metaDescription"
        helper={`${descLen} / 160 characters`}
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
