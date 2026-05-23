'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Star, X, Camera } from 'lucide-react';
import {
  createReviewAction,
  type CreateReviewResult,
} from '@/lib/actions/storefront-reviews';
import {
  REVIEW_ACCEPTED_PHOTO_TYPES,
  REVIEW_MAX_PHOTOS,
  REVIEW_MAX_PHOTO_BYTES,
} from '@/lib/reviews/photo-limits';
import { cn } from '@/lib/utils/cn';

interface ReviewFormProps {
  productId: string;
  productSlug: string;
}

interface FormState {
  authorName: string;
  rating: number;
  hover: number;
  title: string;
  body: string;
  photos: File[];
}

const initialState: FormState = {
  authorName: '',
  rating: 0,
  hover: 0,
  title: '',
  body: '',
  photos: [],
};

const acceptString = REVIEW_ACCEPTED_PHOTO_TYPES.join(',');

export function ReviewForm({ productId, productSlug }: ReviewFormProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<CreateReviewResult['fieldErrors']>({});
  const [topError, setTopError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Object-URL previews. Re-derived whenever the file list changes;
  // revoke on cleanup so we don't leak blob URLs.
  const [previews, setPreviews] = useState<string[]>([]);
  useEffect(() => {
    const urls = state.photos.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [state.photos]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function addPhotos(files: FileList | null) {
    if (!files || files.length === 0) return;
    const incoming = Array.from(files);
    const next: File[] = [...state.photos];
    let localError: string | null = null;
    for (const f of incoming) {
      if (next.length >= REVIEW_MAX_PHOTOS) {
        localError = `Up to ${REVIEW_MAX_PHOTOS} photos per review.`;
        break;
      }
      if (
        !REVIEW_ACCEPTED_PHOTO_TYPES.includes(
          f.type as (typeof REVIEW_ACCEPTED_PHOTO_TYPES)[number],
        )
      ) {
        localError = 'Photos must be PNG, JPG, WebP, or AVIF.';
        continue;
      }
      if (f.size > REVIEW_MAX_PHOTO_BYTES) {
        localError = `Each photo must be under ${Math.round(
          REVIEW_MAX_PHOTO_BYTES / (1024 * 1024),
        )}MB.`;
        continue;
      }
      next.push(f);
    }
    update('photos', next);
    setErrors((e) => ({ ...e, photos: localError ?? undefined }));
    // Reset the input so re-selecting the same file fires `onChange` again.
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removePhoto(index: number) {
    update(
      'photos',
      state.photos.filter((_, i) => i !== index),
    );
    setErrors((e) => ({ ...e, photos: undefined }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setTopError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set('productId', productId);
      fd.set('productSlug', productSlug);
      fd.set('authorName', state.authorName);
      fd.set('rating', String(state.rating));
      fd.set('title', state.title);
      fd.set('body', state.body);
      for (const f of state.photos) fd.append('photos', f);

      const res = await createReviewAction(fd);
      if (res.ok) {
        setSuccess(true);
        setState(initialState);
        setOpen(false);
        return;
      }
      if (res.fieldErrors) setErrors(res.fieldErrors);
      if (res.message) setTopError(res.message);
    });
  }

  if (!open) {
    return (
      <div className="border border-border-hairline p-6 text-center">
        {success ? (
          <>
            <p className="text-body text-text-primary">
              Thanks for sharing — your review is awaiting moderation.
            </p>
            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                setOpen(true);
              }}
              className="mt-3 text-caption uppercase tracking-[0.12em] text-accent-ember underline underline-offset-4"
            >
              Write another review
            </button>
          </>
        ) : (
          <>
            <p className="text-body text-text-secondary">
              Wore this piece? Help future shoppers — share your honest review.
            </p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-4 inline-flex h-11 items-center justify-center bg-accent-ember px-6 text-caption font-medium uppercase tracking-[0.12em] text-bg-canvas transition-opacity duration-fast ease-standard hover:opacity-90"
            >
              Write a review
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="space-y-5 border border-border-hairline p-6"
    >
      <div className="flex items-baseline justify-between">
        <p className="text-body-lg font-medium text-text-primary">
          Write a review
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-caption text-text-muted underline underline-offset-4 hover:text-text-primary"
        >
          Cancel
        </button>
      </div>

      <div>
        <label className="eyebrow mb-2 block text-text-secondary">Rating</label>
        <div
          className="flex items-center gap-1"
          onMouseLeave={() => update('hover', 0)}
        >
          {[1, 2, 3, 4, 5].map((n) => {
            const active = (state.hover || state.rating) >= n;
            return (
              <button
                key={n}
                type="button"
                aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`}
                onClick={() => update('rating', n)}
                onMouseEnter={() => update('hover', n)}
                className="p-1"
              >
                <Star
                  className={cn(
                    'h-7 w-7 transition-colors duration-fast ease-standard',
                    active ? 'text-accent-saffron' : 'text-border-default',
                  )}
                  strokeWidth={1.5}
                  fill={active ? 'currentColor' : 'none'}
                />
              </button>
            );
          })}
        </div>
        {errors?.rating && (
          <p className="mt-2 text-caption text-accent-crimson">{errors.rating}</p>
        )}
      </div>

      <label className="block">
        <span className="eyebrow mb-2 block text-text-secondary">Your name</span>
        <input
          type="text"
          value={state.authorName}
          onChange={(e) => update('authorName', e.target.value)}
          className={cn(
            'h-11 w-full border bg-bg-canvas px-3 text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-ember focus:ring-offset-2',
            errors?.authorName ? 'border-accent-crimson' : 'border-border-default',
          )}
          placeholder="How should we credit you?"
          autoComplete="name"
        />
        {errors?.authorName && (
          <p className="mt-1 text-caption text-accent-crimson">
            {errors.authorName}
          </p>
        )}
      </label>

      <label className="block">
        <span className="eyebrow mb-2 block text-text-secondary">
          Title <span className="lowercase tracking-normal text-text-muted">(optional)</span>
        </span>
        <input
          type="text"
          value={state.title}
          onChange={(e) => update('title', e.target.value)}
          className={cn(
            'h-11 w-full border bg-bg-canvas px-3 text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-ember focus:ring-offset-2',
            errors?.title ? 'border-accent-crimson' : 'border-border-default',
          )}
          placeholder="A one-line summary"
        />
        {errors?.title && (
          <p className="mt-1 text-caption text-accent-crimson">{errors.title}</p>
        )}
      </label>

      <label className="block">
        <span className="eyebrow mb-2 block text-text-secondary">
          Your review
        </span>
        <textarea
          value={state.body}
          onChange={(e) => update('body', e.target.value)}
          rows={5}
          className={cn(
            'w-full border bg-bg-canvas px-3 py-2 text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-ember focus:ring-offset-2',
            errors?.body ? 'border-accent-crimson' : 'border-border-default',
          )}
          placeholder="What did you love? Fit, fabric, finish — anything that helps the next shopper."
        />
        {errors?.body && (
          <p className="mt-1 text-caption text-accent-crimson">{errors.body}</p>
        )}
      </label>

      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="eyebrow text-text-secondary">
            Photos{' '}
            <span className="lowercase tracking-normal text-text-muted">
              (optional · up to {REVIEW_MAX_PHOTOS})
            </span>
          </span>
          <span className="text-caption text-text-muted">
            {state.photos.length}/{REVIEW_MAX_PHOTOS}
          </span>
        </div>

        {previews.length > 0 && (
          <ul className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {previews.map((src, i) => (
              <li
                key={`${src}-${i}`}
                className="relative aspect-square overflow-hidden border border-border-hairline bg-bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Selected photo ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  aria-label={`Remove photo ${i + 1}`}
                  className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-bg-canvas/90 text-text-primary shadow-sm hover:bg-bg-canvas"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={state.photos.length >= REVIEW_MAX_PHOTOS}
          className={cn(
            'inline-flex h-11 items-center gap-2 border border-border-default bg-bg-canvas px-4 text-caption font-medium uppercase tracking-[0.12em] text-text-primary transition-colors duration-fast ease-standard hover:bg-bg-subtle',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <Camera className="h-4 w-4" strokeWidth={1.5} />
          {state.photos.length === 0 ? 'Add photos' : 'Add more photos'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptString}
          multiple
          className="hidden"
          onChange={(e) => addPhotos(e.target.files)}
        />
        {errors?.photos && (
          <p className="mt-2 text-caption text-accent-crimson">
            {errors.photos}
          </p>
        )}
      </div>

      {topError && (
        <p className="text-caption text-accent-crimson">{topError}</p>
      )}

      <div className="flex items-center justify-between">
        <p className="text-caption text-text-muted">
          Reviews are moderated before they appear on the site.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center bg-accent-ember px-6 text-caption font-medium uppercase tracking-[0.12em] text-bg-canvas transition-opacity duration-fast ease-standard hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Submitting…' : 'Submit review'}
        </button>
      </div>
    </form>
  );
}
