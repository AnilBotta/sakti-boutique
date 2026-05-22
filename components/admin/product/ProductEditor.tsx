'use client';

import { useState, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AdminFormSection } from '@/components/admin/form';
import { slugify, type EditableProduct } from '@/lib/admin/product-editor';
import { summarizeErrorSections } from '@/lib/admin/field-errors';
import type { FieldError } from '@/lib/validation/product';
import {
  saveProductAction,
  deleteProductAction,
} from '@/lib/actions/admin-products';
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
  // Field-level errors from the last failed save attempt. Surfaced inline
  // next to each input and summarized in the top-of-form banner.
  const [fieldErrors, setFieldErrors] = useState<FieldError[] | null>(null);
  const [topMessage, setTopMessage] = useState<string | null>(null);
  // When true, edits to the product name also live-update the SEO slug.
  // Flips false the moment the operator manually edits the slug. New products
  // start with auto-sync ON; existing products keep their canonical slug.
  const [slugAutoSynced, setSlugAutoSynced] = useState<boolean>(
    mode === 'create' && !initial.seo.slug,
  );
  const [, startTransition] = useTransition();

  const dirty = JSON.stringify(product) !== JSON.stringify(savedSnapshot);

  const patch = useCallback(
    (p: Partial<EditableProduct>) => {
      setProduct((prev) => {
        const next = { ...prev, ...p };
        // Live-derive the slug from the name while auto-sync is enabled.
        if (slugAutoSynced && p.name !== undefined && p.name !== prev.name) {
          next.seo = { ...next.seo, slug: slugify(p.name) };
        }
        return next;
      });
    },
    [slugAutoSynced],
  );

  // Dedicated SEO patch helper — detects manual slug edits and flips off the
  // auto-sync flag so future name edits don't overwrite the operator's choice.
  const patchSeo = useCallback(
    (seoPatch: Partial<EditableProduct['seo']>) => {
      setProduct((prev) => {
        const userEditedSlug =
          seoPatch.slug !== undefined && seoPatch.slug !== prev.seo.slug;
        if (userEditedSlug && slugAutoSynced) {
          setSlugAutoSynced(false);
        }
        return { ...prev, seo: { ...prev.seo, ...seoPatch } };
      });
    },
    [slugAutoSynced],
  );

  const handleSave = () => {
    setSavingState('saving');
    setFieldErrors(null);
    setTopMessage(null);
    startTransition(async () => {
      const res = await saveProductAction(product);
      if (!res.ok) {
        const failed = res.errors ?? [];
        setFieldErrors(failed);
        const sections = summarizeErrorSections(failed);
        // `root` errors are non-field issues (e.g. DB write failures); show
        // their message verbatim so operators see what actually went wrong.
        const rootError = failed.find((e) => e.path === 'root')?.message;
        setTopMessage(
          sections.length
            ? `Fix the highlighted fields: ${sections.join(', ')}`
            : rootError || res.message || 'Save failed',
        );
        setSavingState('idle');
        return;
      }
      const savedId = res.data.id;
      // Refresh the local snapshot so dirty-check resets.
      const saved: EditableProduct = { ...product, id: savedId };
      setSavedSnapshot(saved);
      setProduct(saved);
      setSavingState('saved');
      setFieldErrors(null);
      setTopMessage(null);
      if (mode === 'create' && savedId && savedId !== product.id) {
        router.replace(`/admin/products/${savedId}`);
      } else {
        router.refresh();
      }
      setTimeout(() => setSavingState('idle'), 1800);
    });
  };
  const handleDiscard = () => {
    setProduct(savedSnapshot);
    setFieldErrors(null);
    setTopMessage(null);
    // Recompute slug auto-sync from the snapshot we're reverting to. Without
    // this, a user who manually edited the slug once (turning auto-sync off)
    // and then hit Discard would lose live slug derivation against the
    // freshly-blank name field — surprising behaviour after a "revert".
    setSlugAutoSynced(mode === 'create' && !savedSnapshot.seo.slug);
  };
  const handleDelete = () => {
    if (mode !== 'edit') return;
    if (!confirm(`Delete "${product.name || 'this product'}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteProductAction(product.id);
      if (!res.ok) {
        setTopMessage(res.message || 'Delete failed');
        return;
      }
      router.replace('/admin/products');
    });
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

      {topMessage ? (
        <div
          role="alert"
          className="mt-4 rounded-md border border-state-danger/30 bg-state-danger/5 px-4 py-3 text-caption text-state-danger"
        >
          {topMessage}
        </div>
      ) : null}

      <div className="flex flex-col gap-6 pt-6">
        <AdminFormSection
          step="01"
          eyebrow="Basic Info"
          title="Tell the story of this product"
          description="Operator-facing name, editorial description, and material details. This content flows straight into the PDP."
        >
          <BasicInfoCard
            product={product}
            onChange={patch}
            errors={fieldErrors}
          />
        </AdminFormSection>

        <AdminFormSection
          step="02"
          eyebrow="Pricing"
          title="Price and compare-at"
          description="Set the default price shown on the catalog. Variant-level overrides are handled in the Variants section."
        >
          <PricingCard
            product={product}
            onChange={patch}
            errors={fieldErrors}
          />
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
            errors={fieldErrors}
          />
        </AdminFormSection>

        <AdminFormSection
          step="06"
          eyebrow="Media"
          title="Gallery and cover image"
          description="The cover image appears first on category grids and PDP. Drag tiles to reorder, click the star to change the cover."
        >
          <MediaGalleryField
            productId={product.id}
            media={product.media}
            onChange={(next) => patch({ media: next })}
            errors={fieldErrors}
          />
        </AdminFormSection>

        <AdminFormSection
          step="07"
          eyebrow="SEO"
          title="Search visibility"
          description="Slug, meta title, and description. Previewed as a Google-style snippet below."
        >
          <SeoFieldsCard
            product={product}
            onChange={patch}
            onSeoChange={patchSeo}
            slugAutoSynced={slugAutoSynced}
            errors={fieldErrors}
          />
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
          <ChannelMappingCard
            product={product}
            onChange={patch}
            errors={fieldErrors}
          />
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
