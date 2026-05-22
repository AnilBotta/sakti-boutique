'use client';

import Image from 'next/image';
import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { AdminInput, AdminFieldRow } from '@/components/admin/form';
import {
  uploadProductMedia,
  deleteProductMedia,
  validateImageFile,
  ACCEPTED_IMAGE_TYPES,
} from '@/lib/admin/product-media-upload';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { saveSiteImageAction } from '@/lib/actions/admin-site-imagery';
import type {
  SiteImage,
  SiteImageSlot,
} from '@/lib/repositories/site-imagery';
import { cn } from '@/lib/utils/cn';

interface SiteImagerySlotEditorProps {
  slot: SiteImageSlot;
  description?: string;
  initial: SiteImage;
}

const ACCEPT_ATTR = ACCEPTED_IMAGE_TYPES.join(',');

/**
 * Single-slot editor: preview + upload + alt-text + save/clear.
 *
 * Upload flow:
 *   1. User picks a file → uploaded directly to `product-media` bucket via
 *      the existing browser client (RLS gates writes to admin role).
 *   2. The resolved publicUrl + storagePath are stamped into local state.
 *   3. On Save, a Server Action upserts the row in `site_imagery` and
 *      revalidates the homepage so the change is visible immediately.
 *   4. Replacing or clearing best-effort deletes the previous storage object.
 */
export function SiteImagerySlotEditor({
  slot,
  description,
  initial,
}: SiteImagerySlotEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [url, setUrl] = useState<string | null>(initial.url);
  const [storagePath, setStoragePath] = useState<string | null>(
    initial.storagePath,
  );
  const [alt, setAlt] = useState<string>(initial.alt ?? '');

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved'>(
    'idle',
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const dirty =
    url !== initial.url ||
    storagePath !== initial.storagePath ||
    alt !== (initial.alt ?? '');

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!isSupabaseConfigured()) {
      setUploadError(
        'Supabase is not configured in this environment — uploads only work on the deployed admin.',
      );
      return;
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setUploadError(null);
    setUploading(true);
    try {
      // Scope storage to `site/<slot>/` so editorial assets are easy to find.
      const { storagePath: newPath, publicUrl } = await uploadProductMedia(
        `site-${slot}`,
        file,
      );
      // Best-effort clean up the previous object (if any) before swapping.
      if (storagePath) void deleteProductMedia(storagePath);
      setUrl(publicUrl);
      setStoragePath(newPath);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Upload failed. Try again.',
      );
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    if (storagePath) void deleteProductMedia(storagePath);
    setUrl(null);
    setStoragePath(null);
  };

  const handleSave = () => {
    setSavingState('saving');
    setSaveError(null);
    startTransition(async () => {
      const res = await saveSiteImageAction({
        slot,
        url,
        storagePath,
        alt: alt || null,
      });
      if (!res.ok) {
        setSaveError(res.message);
        setSavingState('idle');
        return;
      }
      setSavingState('saved');
      router.refresh();
      setTimeout(() => setSavingState('idle'), 1800);
    });
  };

  return (
    <div className="flex flex-col gap-5 px-6 py-6">
      {description && (
        <p className="text-caption text-text-muted">{description}</p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px,1fr]">
        {/* Preview tile */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-text-muted">
            Current image
          </span>
          <div
            className={cn(
              'relative aspect-[4/5] w-full overflow-hidden border bg-bg-muted',
              url ? 'border-border-hairline' : 'border-dashed border-border-default',
            )}
          >
            {url ? (
              <Image
                src={url}
                alt={alt || 'Site image preview'}
                fill
                sizes="(min-width: 1024px) 200px, 90vw"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-caption text-text-muted">
                No image yet
              </div>
            )}
          </div>
        </div>

        {/* Actions + fields */}
        <div className="flex flex-col gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_ATTR}
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handlePickFile}
              disabled={uploading}
              className="inline-flex h-10 items-center gap-2 border border-text-primary px-4 text-caption font-medium uppercase tracking-[0.12em] text-text-primary transition-colors duration-fast ease-standard hover:bg-text-primary hover:text-bg-canvas disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
              ) : (
                <ImagePlus className="h-4 w-4" strokeWidth={1.5} />
              )}
              {uploading ? 'Uploading…' : url ? 'Replace image' : 'Upload image'}
            </button>
            {url && (
              <button
                type="button"
                onClick={handleClear}
                disabled={uploading}
                className="inline-flex h-10 items-center gap-2 px-3 text-caption uppercase tracking-[0.12em] text-text-secondary transition-colors duration-fast ease-standard hover:text-accent-crimson disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                Remove
              </button>
            )}
          </div>

          {uploadError && (
            <p
              role="alert"
              className="text-caption text-accent-crimson"
            >
              {uploadError}
            </p>
          )}

          <AdminFieldRow
            label="Alt text"
            htmlFor={`alt-${slot}`}
            helper="Used for screen readers and shown if the image fails to load."
          >
            <AdminInput
              id={`alt-${slot}`}
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Hand-embroidered saree against a deep crimson backdrop"
            />
          </AdminFieldRow>

          <div className="flex items-center justify-between gap-4 border-t border-border-hairline pt-4">
            <span className="text-caption text-text-muted">
              {savingState === 'saved'
                ? 'Saved.'
                : dirty
                  ? 'Unsaved changes'
                  : 'All changes saved'}
            </span>
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty || savingState === 'saving' || uploading}
              className="inline-flex h-10 items-center px-5 text-button font-medium uppercase tracking-[0.02em] text-bg-canvas bg-accent-ember transition-colors duration-fast ease-standard hover:bg-accent-ember/90 disabled:bg-border-default disabled:text-text-muted"
            >
              {savingState === 'saving' ? 'Saving…' : 'Save'}
            </button>
          </div>

          {saveError && (
            <p role="alert" className="text-caption text-accent-crimson">
              {saveError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
