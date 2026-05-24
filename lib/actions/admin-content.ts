'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/admin';
import {
  saveContentPage,
  deleteContentPage,
  type ContentBlock,
  type ContentPageStatus,
  type SaveContentPageInput,
} from '@/lib/repositories/content';

const MAX_TITLE = 160;
const MAX_META_TITLE = 160;
const MAX_META_DESCRIPTION = 320;
const MAX_BODY_CHARS = 50_000;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED_SLUGS = new Set([
  '',
  'about',
  'faq',
  'contact',
  'cart',
  'checkout',
  'account',
  'wishlist',
  'admin',
  'api',
  'women',
  'men',
  'kids',
  'p',
  'style-guide',
  'journal',
]);

export interface SaveContentPageResult {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<
    Record<
      'slug' | 'title' | 'body' | 'metaTitle' | 'metaDescription',
      string
    >
  >;
  slug?: string;
}

/**
 * Parse the editor's textarea into structured ContentBlocks.
 *
 * Rules (kept intentionally tiny — no markdown dep):
 *   - Lines are grouped into blocks by blank lines.
 *   - A block beginning with `# ` becomes a level-2 heading.
 *     (We reserve <h1> for the page title rendered by the route.)
 *   - A block beginning with `## ` becomes a level-3 heading.
 *   - A block matching `![alt](url)` becomes an image block.
 *   - Anything else becomes a paragraph; newlines inside a paragraph
 *     are collapsed to spaces.
 */
function parseBody(raw: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const paragraphs = raw
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  for (const p of paragraphs) {
    const imageMatch = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(p);
    if (imageMatch) {
      blocks.push({
        type: 'image',
        alt: imageMatch[1].trim(),
        src: imageMatch[2].trim(),
      });
      continue;
    }
    if (p.startsWith('## ')) {
      blocks.push({
        type: 'heading',
        level: 3,
        text: p.slice(3).trim(),
      });
      continue;
    }
    if (p.startsWith('# ')) {
      blocks.push({
        type: 'heading',
        level: 2,
        text: p.slice(2).trim(),
      });
      continue;
    }
    blocks.push({
      type: 'paragraph',
      text: p.replace(/\s*\n\s*/g, ' ').trim(),
    });
  }
  return blocks;
}

export async function saveContentPageAction(
  formData: FormData,
): Promise<SaveContentPageResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, message: 'Admin access required.' };
  }

  const fieldErrors: NonNullable<SaveContentPageResult['fieldErrors']> = {};

  const id = (formData.get('id')?.toString() || '').trim() || undefined;
  const slug = (formData.get('slug')?.toString() || '').trim().toLowerCase();
  const title = (formData.get('title')?.toString() || '').trim();
  const status = (formData.get('status')?.toString() || 'draft') as ContentPageStatus;
  const bodyRaw = formData.get('body')?.toString() ?? '';
  const metaTitle =
    (formData.get('metaTitle')?.toString() || '').trim() || null;
  const metaDescription =
    (formData.get('metaDescription')?.toString() || '').trim() || null;

  if (!SLUG_PATTERN.test(slug)) {
    fieldErrors.slug =
      'Use lowercase letters, numbers, and hyphens — no spaces.';
  } else if (RESERVED_SLUGS.has(slug)) {
    fieldErrors.slug = `"${slug}" is reserved — pick a different slug.`;
  }

  if (title.length < 2) {
    fieldErrors.title = 'Please enter a title.';
  } else if (title.length > MAX_TITLE) {
    fieldErrors.title = `Keep the title under ${MAX_TITLE} characters.`;
  }

  if (bodyRaw.length > MAX_BODY_CHARS) {
    fieldErrors.body = `Body is too long (${bodyRaw.length} chars; max ${MAX_BODY_CHARS}).`;
  }

  if (metaTitle && metaTitle.length > MAX_META_TITLE) {
    fieldErrors.metaTitle = `Keep meta title under ${MAX_META_TITLE} characters.`;
  }
  if (metaDescription && metaDescription.length > MAX_META_DESCRIPTION) {
    fieldErrors.metaDescription = `Keep meta description under ${MAX_META_DESCRIPTION} characters.`;
  }

  if (status !== 'draft' && status !== 'published') {
    return { ok: false, message: 'Invalid status.' };
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  const body = parseBody(bodyRaw);
  const input: SaveContentPageInput = {
    id,
    slug,
    title,
    status,
    body,
    metaTitle,
    metaDescription,
  };

  const res = await saveContentPage(input);
  if (!res.ok) {
    if (res.error === 'conflict') {
      return {
        ok: false,
        fieldErrors: { slug: res.message },
      };
    }
    return { ok: false, message: res.message };
  }

  revalidatePath('/admin/content');
  revalidatePath(`/admin/content/${res.slug}`);
  revalidatePath(`/journal/${res.slug}`);
  return { ok: true, slug: res.slug };
}

export async function deleteContentPageAction(
  id: string,
  slug: string,
): Promise<{ ok: boolean; message?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, message: 'Admin access required.' };
  }
  const res = await deleteContentPage(id);
  if (!res.ok) return { ok: false, message: res.message };
  revalidatePath('/admin/content');
  revalidatePath(`/journal/${slug}`);
  // Send the operator back to the list. Using redirect inside a server action
  // throws a NEXT_REDIRECT internally; the caller never sees the return value
  // after this point.
  redirect('/admin/content');
}
