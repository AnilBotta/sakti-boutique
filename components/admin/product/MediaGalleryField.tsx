'use client';

import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import { ImagePlus, Star, Trash2, Move, Loader2 } from 'lucide-react';
import { AdminInput } from '@/components/admin/form';
import { makeEmptyMedia, type EditableMedia } from '@/lib/admin/product-editor';
import {
  uploadProductMedia,
  deleteProductMedia,
  validateImageFile,
  ACCEPTED_IMAGE_TYPES,
  type UploadFailure,
} from '@/lib/admin/product-media-upload';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { cn } from '@/lib/utils/cn';

interface MediaGalleryFieldProps {
  media: EditableMedia[];
  onChange: (next: EditableMedia[]) => void;
  /** Product id used to scope storage paths. May be a temporary uid for unsaved products. */
  productId: string;
}

const ACCEPT_ATTR = ACCEPTED_IMAGE_TYPES.join(',');

/**
 * Media gallery with real Supabase Storage uploads and HTML5 drag-to-reorder.
 *
 * - Click-to-browse opens the OS file picker
 * - Drag-and-drop files anywhere on the dropzone
 * - Multiple files supported; each is uploaded in parallel
 * - Drag a tile by its handle to reorder; first tile is the cover unless an
 *   explicit cover is set
 * - Removing a tile also fires a best-effort delete of the storage object
 */
export function MediaGalleryField({ media, onChange, productId }: MediaGalleryFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<UploadFailure[]>([]);

  const configured = isSupabaseConfigured();

  const update = (uid: string, patch: Partial<EditableMedia>) => {
    onChange(media.map((m) => (m.uid === uid ? { ...m, ...patch } : m)));
  };

  const remove = (uid: string) => {
    const target = media.find((m) => m.uid === uid);
    const next = media.filter((m) => m.uid !== uid);
    if (next.length && !next.some((m) => m.isCover)) {
      next[0] = { ...next[0], isCover: true };
    }
    onChange(next);
    if (target?.storagePath) {
      void deleteProductMedia(target.storagePath);
    }
  };

  const setCover = (uid: string) => {
    onChange(media.map((m) => ({ ...m, isCover: m.uid === uid })));
  };

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (!list.length) return;

      if (!configured) {
        setErrors([
          {
            fileName: list[0].name,
            reason:
              'Supabase is not configured in this environment — uploads only work on the deployed admin.',
          },
        ]);
        return;
      }

      setErrors([]);
      setUploading(true);

      const results: { media: EditableMedia | null; failure: UploadFailure | null }[] =
        await Promise.all(
          list.map(async (file) => {
            const validationError = validateImageFile(file);
            if (validationError) {
              return {
                media: null,
                failure: { fileName: file.name, reason: validationError },
              };
            }
            try {
              const { storagePath, publicUrl } = await uploadProductMedia(productId, file);
              return {
                media: makeEmptyMedia({
                  url: publicUrl,
                  storagePath,
                  alt: '',
                  isCover: false,
                }),
                failure: null,
              };
            } catch (e) {
              const reason = e instanceof Error ? e.message : 'Upload failed';
              return { media: null, failure: { fileName: file.name, reason } };
            }
          }),
        );

      const uploaded = results.map((r) => r.media).filter((m): m is EditableMedia => !!m);
      const failures = results.map((r) => r.failure).filter((f): f is UploadFailure => !!f);

      if (uploaded.length) {
        const merged = [...media, ...uploaded];
        if (!merged.some((m) => m.isCover) && merged.length) {
          merged[0] = { ...merged[0], isCover: true };
        }
        onChange(merged);
      }
      if (failures.length) setErrors(failures);
      setUploading(false);
    },
    [media, onChange, productId, configured],
  );

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.length) {
      void handleFiles(e.dataTransfer.files);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      setIsDragOver(true);
    }
  };

  const onDragLeave = () => setIsDragOver(false);

  const openPicker = () => fileInputRef.current?.click();

  // ---- Tile reorder (HTML5 drag-and-drop on tiles) ----
  const reorder = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= media.length || to >= media.length) return;
    const next = media.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  const onTileDragStart = (index: number) => (e: React.DragEvent<HTMLLIElement>) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Required for Firefox to actually start the drag
    e.dataTransfer.setData('text/plain', String(index));
  };

  const onTileDragOver = (index: number) => (e: React.DragEvent<HTMLLIElement>) => {
    if (dragIndex === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (overIndex !== index) setOverIndex(index);
  };

  const onTileDrop = (index: number) => (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    if (dragIndex !== null) reorder(dragIndex, index);
    setDragIndex(null);
    setOverIndex(null);
  };

  const onTileDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Upload dropzone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={cn(
          'group relative flex flex-col items-center justify-center gap-2 border border-dashed bg-bg-subtle px-6 py-10 text-center transition-colors duration-fast ease-standard',
          isDragOver
            ? 'border-accent-ember bg-bg-muted'
            : 'border-border-default hover:border-accent-ember hover:bg-bg-muted',
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPT_ATTR}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files);
            // Reset so re-selecting the same file fires onChange again
            e.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={openPicker}
          disabled={uploading}
          aria-label="Add media"
          className="flex flex-col items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-ember/30"
        >
          {uploading ? (
            <Loader2
              className="h-6 w-6 animate-spin text-accent-ember"
              strokeWidth={1.5}
            />
          ) : (
            <ImagePlus
              className="h-6 w-6 text-text-muted group-hover:text-accent-ember"
              strokeWidth={1.5}
            />
          )}
          <div className="text-body font-medium text-text-primary">
            {uploading ? 'Uploading…' : 'Drop images or click to browse'}
          </div>
          <p className="max-w-md text-caption text-text-muted">
            PNG, JPG, WebP, or AVIF up to 8MB. 4:5 ratio recommended for product photography.
          </p>
        </button>
      </div>

      {errors.length > 0 && (
        <ul
          role="alert"
          className="flex flex-col gap-1 border border-state-danger/40 bg-state-danger/5 px-4 py-3 text-caption text-state-danger"
        >
          {errors.map((err, i) => (
            <li key={`${err.fileName}-${i}`}>
              <span className="font-medium">{err.fileName}:</span> {err.reason}
            </li>
          ))}
        </ul>
      )}

      {media.length > 0 && (
        <div className="flex items-center justify-between text-caption text-text-muted">
          <span>
            {media.length} image{media.length === 1 ? '' : 's'} ·{' '}
            <span className="italic">drag the handle to reorder</span>
          </span>
          <span className="text-[11px] uppercase tracking-[0.12em]">
            Cover marked with ★
          </span>
        </div>
      )}

      <ul
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        role="list"
      >
        {media.map((m, index) => (
          <li
            key={m.uid}
            draggable
            onDragStart={onTileDragStart(index)}
            onDragOver={onTileDragOver(index)}
            onDrop={onTileDrop(index)}
            onDragEnd={onTileDragEnd}
            className={cn(
              'group relative flex flex-col gap-3 border bg-bg-canvas p-3 transition-colors duration-fast ease-standard',
              m.isCover
                ? 'border-accent-ember ring-1 ring-accent-ember/40'
                : 'border-border-hairline',
              overIndex === index && dragIndex !== index && 'border-accent-ember',
              dragIndex === index && 'opacity-60',
            )}
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-bg-muted">
              {m.url ? (
                <Image
                  src={m.url}
                  alt={m.alt || 'Product image'}
                  fill
                  sizes="(min-width: 1280px) 240px, (min-width: 640px) 45vw, 90vw"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-caption text-text-muted">
                  No image
                </div>
              )}
              {m.isCover && (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 bg-bg-canvas/90 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-accent-ember">
                  <Star className="h-3 w-3 fill-accent-ember" strokeWidth={1.5} />
                  Cover
                </span>
              )}
              <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity duration-fast ease-standard group-hover:opacity-100 focus-within:opacity-100">
                <IconButton
                  label="Drag to reorder"
                  // The drag handle is the whole tile; this icon just signals affordance
                  onClick={() => {
                    /* visual only */
                  }}
                  title="Drag the tile to reorder"
                >
                  <Move className="h-3.5 w-3.5" strokeWidth={1.5} />
                </IconButton>
                {!m.isCover && (
                  <IconButton
                    label="Set as cover"
                    onClick={() => setCover(m.uid)}
                  >
                    <Star className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </IconButton>
                )}
                <IconButton label="Remove" danger onClick={() => remove(m.uid)}>
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </IconButton>
              </div>
            </div>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-text-muted">
                Alt text
              </span>
              <AdminInput
                value={m.alt}
                onChange={(e) => update(m.uid, { alt: e.target.value })}
                placeholder="Describe the image for accessibility"
                aria-label="Alt text"
              />
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
  danger,
  title,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={title ?? label}
      className={cn(
        'inline-flex h-7 w-7 items-center justify-center bg-bg-canvas/95 text-text-secondary shadow-sm',
        'transition-colors duration-fast ease-standard hover:text-text-primary',
        danger && 'hover:text-accent-crimson',
      )}
    >
      {children}
    </button>
  );
}
