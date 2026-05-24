'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, Trash2 } from 'lucide-react';
import {
  saveContentPageAction,
  deleteContentPageAction,
  type SaveContentPageResult,
} from '@/lib/actions/admin-content';
import type {
  ContentBlock,
  ContentPageStatus,
} from '@/lib/repositories/content';
import { cn } from '@/lib/utils/cn';

interface ContentEditorProps {
  mode: 'create' | 'edit';
  initial: {
    id?: string;
    slug: string;
    title: string;
    status: ContentPageStatus;
    body: ContentBlock[];
    metaTitle: string | null;
    metaDescription: string | null;
  };
}

/**
 * Serialize structured blocks back into the textarea format the parser in
 * lib/actions/admin-content.ts understands. Round-trips cleanly so editing a
 * saved page shows the same source the operator typed.
 */
function blocksToSource(blocks: ContentBlock[]): string {
  return blocks
    .map((b) => {
      if (b.type === 'heading') {
        return (b.level === 3 ? '## ' : '# ') + b.text;
      }
      if (b.type === 'image') {
        return `![${b.alt}](${b.src})`;
      }
      return b.text;
    })
    .join('\n\n');
}

const HELP_TEXT = `# Heading
Plain paragraph text goes on its own line.

## Smaller heading

Separate paragraphs with a blank line.

![alt text](https://example.com/image.jpg)`;

export function ContentEditor({ mode, initial }: ContentEditorProps) {
  const router = useRouter();
  const [slug, setSlug] = useState(initial.slug);
  const [title, setTitle] = useState(initial.title);
  const [status, setStatus] = useState<ContentPageStatus>(initial.status);
  const [body, setBody] = useState(() => blocksToSource(initial.body));
  const [metaTitle, setMetaTitle] = useState(initial.metaTitle ?? '');
  const [metaDescription, setMetaDescription] = useState(
    initial.metaDescription ?? '',
  );
  const [errors, setErrors] = useState<SaveContentPageResult['fieldErrors']>({});
  const [topError, setTopError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(nextStatus?: ContentPageStatus) {
    setErrors({});
    setTopError(null);
    const effectiveStatus = nextStatus ?? status;
    startTransition(async () => {
      const fd = new FormData();
      if (initial.id) fd.set('id', initial.id);
      fd.set('slug', slug.trim());
      fd.set('title', title);
      fd.set('status', effectiveStatus);
      fd.set('body', body);
      fd.set('metaTitle', metaTitle);
      fd.set('metaDescription', metaDescription);

      const res = await saveContentPageAction(fd);
      if (res.ok) {
        setStatus(effectiveStatus);
        if (mode === 'create' && res.slug) {
          router.push(`/admin/content/${res.slug}`);
        } else {
          router.refresh();
        }
        return;
      }
      if (res.fieldErrors) setErrors(res.fieldErrors);
      if (res.message) setTopError(res.message);
    });
  }

  function remove() {
    if (!initial.id) return;
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      // The server action redirects on success — control will not return here.
      await deleteContentPageAction(initial.id!, initial.slug);
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="border border-border-hairline bg-bg-canvas p-6">
            <label className="block">
              <span className="eyebrow mb-2 block text-text-secondary">
                Title
              </span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={cn(
                  'h-11 w-full border bg-bg-canvas px-3 text-body-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-ember focus:ring-offset-2',
                  errors?.title
                    ? 'border-accent-crimson'
                    : 'border-border-default',
                )}
                placeholder="The story behind our spring collection"
              />
              {errors?.title && (
                <p className="mt-1 text-caption text-accent-crimson">
                  {errors.title}
                </p>
              )}
            </label>

            <label className="mt-5 block">
              <span className="eyebrow mb-2 block text-text-secondary">
                URL slug
              </span>
              <div className="flex items-stretch">
                <span className="inline-flex items-center border border-r-0 border-border-default bg-bg-muted px-3 text-caption text-text-muted">
                  /journal/
                </span>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className={cn(
                    'h-11 flex-1 border bg-bg-canvas px-3 text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-ember focus:ring-offset-2',
                    errors?.slug
                      ? 'border-accent-crimson'
                      : 'border-border-default',
                  )}
                  placeholder="spring-lookbook"
                  spellCheck={false}
                />
              </div>
              {errors?.slug ? (
                <p className="mt-1 text-caption text-accent-crimson">
                  {errors.slug}
                </p>
              ) : (
                <p className="mt-1 text-caption text-text-muted">
                  Lowercase letters, numbers, and hyphens only.
                </p>
              )}
            </label>
          </div>

          <div className="border border-border-hairline bg-bg-canvas p-6">
            <label className="block">
              <span className="eyebrow mb-2 block text-text-secondary">
                Body
              </span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={20}
                spellCheck
                className={cn(
                  'w-full border bg-bg-canvas px-3 py-2 font-mono text-caption leading-relaxed text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-ember focus:ring-offset-2',
                  errors?.body
                    ? 'border-accent-crimson'
                    : 'border-border-default',
                )}
                placeholder={HELP_TEXT}
              />
              {errors?.body && (
                <p className="mt-1 text-caption text-accent-crimson">
                  {errors.body}
                </p>
              )}
            </label>
            <details className="mt-4">
              <summary className="cursor-pointer text-caption text-text-muted">
                Formatting cheatsheet
              </summary>
              <pre className="mt-3 whitespace-pre-wrap rounded border border-border-hairline bg-bg-subtle p-3 text-caption text-text-secondary">
{HELP_TEXT}
              </pre>
            </details>
          </div>

          <div className="border border-border-hairline bg-bg-canvas p-6">
            <p className="eyebrow mb-4 text-text-secondary">SEO</p>
            <label className="block">
              <span className="text-caption text-text-secondary">
                Meta title{' '}
                <span className="text-text-muted">
                  (defaults to the page title)
                </span>
              </span>
              <input
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className={cn(
                  'mt-1 h-11 w-full border bg-bg-canvas px-3 text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-ember focus:ring-offset-2',
                  errors?.metaTitle
                    ? 'border-accent-crimson'
                    : 'border-border-default',
                )}
              />
              {errors?.metaTitle && (
                <p className="mt-1 text-caption text-accent-crimson">
                  {errors.metaTitle}
                </p>
              )}
            </label>
            <label className="mt-4 block">
              <span className="text-caption text-text-secondary">
                Meta description
              </span>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                className={cn(
                  'mt-1 w-full border bg-bg-canvas px-3 py-2 text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-ember focus:ring-offset-2',
                  errors?.metaDescription
                    ? 'border-accent-crimson'
                    : 'border-border-default',
                )}
              />
              {errors?.metaDescription && (
                <p className="mt-1 text-caption text-accent-crimson">
                  {errors.metaDescription}
                </p>
              )}
            </label>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="border border-border-hairline bg-bg-canvas p-6">
            <p className="eyebrow mb-3 text-text-secondary">Status</p>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'inline-flex h-2 w-2 rounded-full',
                  status === 'published'
                    ? 'bg-state-success'
                    : 'bg-text-muted',
                )}
              />
              <span className="text-body font-medium capitalize text-text-primary">
                {status}
              </span>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => submit('draft')}
                disabled={pending}
                className="h-11 border border-border-default bg-bg-canvas text-caption font-medium uppercase tracking-[0.12em] text-text-primary transition-colors duration-fast ease-standard hover:bg-bg-subtle disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save as draft
              </button>
              <button
                type="button"
                onClick={() => submit('published')}
                disabled={pending}
                className="h-11 bg-accent-ember text-caption font-medium uppercase tracking-[0.12em] text-bg-canvas transition-opacity duration-fast ease-standard hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === 'published' ? 'Save & republish' : 'Publish'}
              </button>
            </div>
            {topError && (
              <p className="mt-3 text-caption text-accent-crimson">{topError}</p>
            )}
          </div>

          {mode === 'edit' && initial.id && (
            <div className="border border-border-hairline bg-bg-canvas p-6">
              <p className="eyebrow mb-3 text-text-secondary">Quick actions</p>
              <div className="space-y-2">
                <Link
                  href={`/journal/${initial.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 items-center justify-center gap-2 border border-border-default text-caption font-medium uppercase tracking-[0.12em] text-text-primary hover:bg-bg-subtle"
                >
                  <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Preview live
                </Link>
                <button
                  type="button"
                  onClick={remove}
                  disabled={pending}
                  className="flex h-10 w-full items-center justify-center gap-2 border border-accent-crimson/40 text-caption font-medium uppercase tracking-[0.12em] text-accent-crimson hover:bg-bg-subtle disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Delete page
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
