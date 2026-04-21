'use client';

import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { AdminSelect } from '@/components/admin/form';
import type {
  EditableProduct,
  ProductStatus,
} from '@/lib/admin/product-editor';

interface AdminProductStatusBarProps {
  product: EditableProduct;
  dirty: boolean;
  onChange: (patch: Partial<EditableProduct>) => void;
  onSave: () => void;
  onDiscard: () => void;
  onDelete?: () => void;
  savingState?: 'idle' | 'saving' | 'saved';
  mode: 'create' | 'edit';
}

/**
 * Sticky status bar at the top of the product editor.
 *
 * - Back link + product title
 * - Current status badge + status <select> shell
 * - Dirty indicator
 * - Discard + Save actions (local-only for now)
 *
 * The bar stays visible while scrolling the long editor so operators always
 * have save / status controls one tap away.
 */
export function AdminProductStatusBar({
  product,
  dirty,
  onChange,
  onSave,
  onDiscard,
  onDelete,
  savingState = 'idle',
  mode,
}: AdminProductStatusBarProps) {
  const saveLabel =
    savingState === 'saving'
      ? 'Saving…'
      : savingState === 'saved'
        ? 'Saved ✓'
        : mode === 'create'
          ? 'Create product'
          : 'Save changes';
  return (
    <div className="sticky top-14 z-20 -mx-4 border-b border-border-hairline bg-bg-canvas/95 px-4 py-3 backdrop-blur md:top-16 md:-mx-6 md:px-6 lg:-mx-10 lg:px-10">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/admin/products"
            className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center border border-border-hairline text-text-secondary transition-colors duration-fast ease-standard hover:text-text-primary"
            aria-label="Back to products"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </Link>
          <div className="min-w-0">
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">
              {mode === 'create' ? 'New product' : 'Editing product'}
            </div>
            <div className="truncate text-body-lg font-medium text-text-primary">
              {product.name || 'Untitled product'}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <AdminStatusBadge status={product.status} />
            <AdminSelect
              aria-label="Change status"
              value={product.status}
              onChange={(e) =>
                onChange({ status: e.target.value as ProductStatus })
              }
              className="h-9 w-[130px]"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </AdminSelect>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-caption ${
                dirty ? 'text-accent-ember' : 'text-text-muted'
              }`}
              aria-live="polite"
            >
              {dirty ? 'Unsaved changes' : 'All changes saved'}
            </span>
            <button
              type="button"
              onClick={onDiscard}
              disabled={!dirty}
              className="h-9 border border-border-default px-3 text-caption font-medium uppercase tracking-[0.12em] text-text-primary transition-colors duration-fast ease-standard hover:bg-bg-subtle disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={savingState === 'saving'}
              className="h-9 bg-accent-ember px-4 text-caption font-medium uppercase tracking-[0.12em] text-bg-canvas transition-opacity duration-fast ease-standard hover:opacity-90 disabled:opacity-60"
            >
              {saveLabel}
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                aria-label="Delete product"
                title="Delete product"
                className="inline-flex h-9 w-9 items-center justify-center border border-border-hairline text-text-secondary transition-colors duration-fast ease-standard hover:text-accent-crimson"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
