'use client';

import Image from 'next/image';
import { ImagePlus, Star, Trash2, Move } from 'lucide-react';
import { AdminInput } from '@/components/admin/form';
import { makeEmptyMedia, type EditableMedia } from '@/lib/admin/product-editor';
import { cn } from '@/lib/utils/cn';

interface MediaGalleryFieldProps {
  media: EditableMedia[];
  onChange: (next: EditableMedia[]) => void;
}

/**
 * Media gallery shell.
 *
 * - Upload dropzone is visual only (no real upload handler yet)
 * - Cover image is highlighted with a ring + star marker
 * - Alt-text field inline on each tile
 * - Reorder affordance is present (grab handle + hint) but not wired
 *
 * Clicking "Add placeholder" appends a demo tile so operators can preview
 * how the gallery feels once uploads are wired.
 */
export function MediaGalleryField({ media, onChange }: MediaGalleryFieldProps) {
  const update = (uid: string, patch: Partial<EditableMedia>) => {
    onChange(media.map((m) => (m.uid === uid ? { ...m, ...patch } : m)));
  };
  const remove = (uid: string) => {
    const next = media.filter((m) => m.uid !== uid);
    // If we removed the cover, promote the first remaining tile.
    if (next.length && !next.some((m) => m.isCover)) {
      next[0] = { ...next[0], isCover: true };
    }
    onChange(next);
  };
  const setCover = (uid: string) => {
    onChange(media.map((m) => ({ ...m, isCover: m.uid === uid })));
  };
  const addPlaceholder = () => {
    const next = [
      ...media,
      makeEmptyMedia({
        url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
        alt: '',
        isCover: media.length === 0,
      }),
    ];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Upload dropzone (shell) */}
      <button
        type="button"
        onClick={addPlaceholder}
        className={cn(
          'group flex flex-col items-center justify-center gap-2 border border-dashed border-border-default bg-bg-subtle px-6 py-10 text-center transition-colors duration-fast ease-standard',
          'hover:border-accent-ember hover:bg-bg-muted focus:outline-none focus-visible:border-accent-ember focus-visible:ring-2 focus-visible:ring-accent-ember/30',
        )}
        aria-label="Add media (placeholder)"
      >
        <ImagePlus
          className="h-6 w-6 text-text-muted group-hover:text-accent-ember"
          strokeWidth={1.5}
        />
        <div className="text-body font-medium text-text-primary">
          Drop images or click to browse
        </div>
        <p className="max-w-md text-caption text-text-muted">
          PNG or JPG up to 8MB. 4:5 ratio recommended for product photography.
          Real uploads will activate once Supabase Storage is wired.
        </p>
      </button>

      {media.length > 0 && (
        <div className="flex items-center justify-between text-caption text-text-muted">
          <span>
            {media.length} image{media.length === 1 ? '' : 's'} ·{' '}
            <span className="italic">drag to reorder — available soon</span>
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
        {media.map((m) => (
          <li
            key={m.uid}
            className={cn(
              'group relative flex flex-col gap-3 border bg-bg-canvas p-3',
              m.isCover
                ? 'border-accent-ember ring-1 ring-accent-ember/40'
                : 'border-border-hairline',
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
                  label="Move"
                  onClick={() => {
                    /* reorder placeholder */
                  }}
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
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
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
