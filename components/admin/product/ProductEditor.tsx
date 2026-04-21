'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminFormSection } from '@/components/admin/form';
import type { EditableProduct } from '@/lib/admin/product-editor';
import {
  createAdminProductLocal,
  updateAdminProductLocal,
  deleteAdminProductLocal,
} from '@/lib/admin/local-repo/products';
import { AdminProductStatusBar } from './AdminProductStatusBar';
import { BasicInfoCard } from './BasicInfoCard';
import { PricingCard } from './PricingCard';
import { InventoryCard } from './InventoryCard';
import { CategoryAssignmentCard } from './CategoryAssignmentCard';
import { VariantMatrix } from './VariantMatrix';
import { MediaGalleryField } from './MediaGalleryField';
import { SeoFieldsCard } from './SeoFieldsCard';
import { MerchandisingFlagsCard } from './MerchandisingFlagsCard';
import { ChannelMappingCard } from './ChannelMappingCard';
import { TryOnEligibilityCard } from './TryOnEligibilityCard';

interface ProductEditorProps {
  initial: EditableProduct;
  mode: 'create' | 'edit';
}

/**
 * Product editor shell.
 *
 * Owns local editor state, status bar actions, and the ordered set of form
 * sections. Everything is local-only — save / discard simply update the
 * in-memory snapshot used to detect dirty state. Replace these with server
 * actions when Supabase lands.
 */
export function ProductEditor({ initial, mode }: ProductEditorProps) {
  const router = useRouter();
  const [product, setProduct] = useState<EditableProduct>(initial);
  const [savedSnapshot, setSavedSnapshot] = useState<EditableProduct>(initial);
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved'>(
    'idle',
  );

  const dirty = JSON.stringify(product) !== JSON.stringify(savedSnapshot);

  const patch = useCallback((p: Partial<EditableProduct>) => {
    setProduct((prev) => ({ ...prev, ...p }));
  }, []);

  const handleSave = () => {
    setSavingState('saving');
    try {
      if (mode === 'create') {
        const saved = createAdminProductLocal(product);
        setSavedSnapshot(saved);
        setProduct(saved);
        setSavingState('saved');
        router.replace(`/admin/products/${saved.id}`);
      } else {
        const saved = updateAdminProductLocal(product.id, product);
        if (saved) {
          setSavedSnapshot(saved);
          setProduct(saved);
        }
        setSavingState('saved');
      }
      setTimeout(() => setSavingState('idle'), 1800);
    } catch (err) {
      console.error('Product save failed', err);
      setSavingState('idle');
    }
  };
  const handleDiscard = () => {
    setProduct(savedSnapshot);
  };
  const handleDelete = () => {
    if (mode !== 'edit') return;
    if (!confirm(`Delete "${product.name || 'this product'}"? This cannot be undone.`)) return;
    deleteAdminProductLocal(product.id);
    router.replace('/admin/products');
  };

  return (
    <div className="flex flex-col">
      <AdminProductStatusBar
        product={product}
        dirty={dirty}
        mode={mode}
        onChange={patch}
        onSave={handleSave}
        onDiscard={handleDiscard}
        onDelete={mode === 'edit' ? handleDelete : undefined}
        savingState={savingState}
      />

      <div className="flex flex-col gap-6 pt-6">
        <AdminFormSection
          step="01"
          eyebrow="Basic Info"
          title="Tell the story of this product"
          description="Operator-facing name, editorial description, and material details. This content flows straight into the PDP."
        >
          <BasicInfoCard product={product} onChange={patch} />
        </AdminFormSection>

        <AdminFormSection
          step="02"
          eyebrow="Pricing"
          title="Price and compare-at"
          description="Set the default price shown on the catalog. Variant-level overrides are handled in the Variants section."
        >
          <PricingCard product={product} onChange={patch} />
        </AdminFormSection>

        <AdminFormSection
          step="03"
          eyebrow="Inventory"
          title="Stock at a glance"
          description="Inventory is tracked per variant. This panel summarises the rollup across all variants."
        >
          <InventoryCard product={product} />
        </AdminFormSection>

        <AdminFormSection
          step="04"
          eyebrow="Category Assignment"
          title="Place this product in the catalog"
          description="Assign audience, category, and subcategory from the locked taxonomy."
        >
          <CategoryAssignmentCard product={product} onChange={patch} />
        </AdminFormSection>

        <AdminFormSection
          step="05"
          eyebrow="Variants"
          title="Size and color combinations"
          description="Each row becomes a purchasable variant on the PDP. SKU, stock, price, and sale price are set per row."
        >
          <VariantMatrix
            variants={product.variants}
            onChange={(next) => patch({ variants: next })}
          />
        </AdminFormSection>

        <AdminFormSection
          step="06"
          eyebrow="Media"
          title="Gallery and cover image"
          description="The cover image appears first on category grids and PDP. Upload workflows activate once Supabase Storage is wired."
        >
          <MediaGalleryField
            media={product.media}
            onChange={(next) => patch({ media: next })}
          />
        </AdminFormSection>

        <AdminFormSection
          step="07"
          eyebrow="SEO"
          title="Search visibility"
          description="Slug, meta title, and description. Previewed as a Google-style snippet below."
        >
          <SeoFieldsCard product={product} onChange={patch} />
        </AdminFormSection>

        <AdminFormSection
          step="08"
          eyebrow="Merchandising"
          title="Flags and badges"
          description="Control which promotional badges appear on product cards and homepage rails."
        >
          <MerchandisingFlagsCard product={product} onChange={patch} />
        </AdminFormSection>

        <AdminFormSection
          step="09"
          eyebrow="Channels"
          title="Amazon channel mapping"
          description="The Sakthi storefront is the primary brand experience. Amazon is a secondary channel."
        >
          <ChannelMappingCard product={product} onChange={patch} />
        </AdminFormSection>

        <AdminFormSection
          step="10"
          eyebrow="Experiences"
          title="Virtual Try-On eligibility"
          description="Enable Try Me on products with clean, mask-ready imagery."
        >
          <TryOnEligibilityCard product={product} onChange={patch} />
        </AdminFormSection>
      </div>
    </div>
  );
}
