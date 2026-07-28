'use client';

import { Instagram } from 'lucide-react';
import { AdminFieldRow, AdminInput } from '@/components/admin/form';
import type { EditableProduct } from '@/lib/admin/product-editor';

interface SocialLinksCardProps {
  product: EditableProduct;
  onChange: (patch: Partial<EditableProduct>) => void;
}

const INSTAGRAM_PATTERN = /^https?:\/\/(?:[a-z0-9-]+\.)*instagram\.com\//i;

/**
 * Instagram (and future social) links for a product.
 *
 * When set, the PDP renders a "Watch on Instagram" button under Add to Cart
 * so shoppers can jump straight to the reel/post for this piece. Leave blank
 * on products that don't have a video — the button won't render.
 */
export function SocialLinksCard({ product, onChange }: SocialLinksCardProps) {
  const value = product.instagramUrl ?? '';
  const trimmed = value.trim();
  const looksValid = trimmed === '' || INSTAGRAM_PATTERN.test(trimmed);
  const invalid = trimmed !== '' && !looksValid;

  return (
    <div className="flex flex-col gap-5">
      <AdminFieldRow
        label="Instagram URL"
        htmlFor="social-instagram-url"
        error={invalid ? 'Enter a valid instagram.com URL (or leave blank).' : undefined}
        helper={
          invalid
            ? undefined
            : 'Paste a full reel or post URL. Shoppers see a "Watch on Instagram" button on the PDP.'
        }
      >
        <AdminInput
          id="social-instagram-url"
          type="url"
          value={value}
          onChange={(e) =>
            onChange({ instagramUrl: e.target.value || null })
          }
          placeholder="https://www.instagram.com/reel/xxxxxxxxxxx/"
          invalid={invalid}
        />
      </AdminFieldRow>

      {trimmed && !invalid ? (
        <div className="border border-border-hairline bg-bg-subtle p-4">
          <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-text-muted">
            PDP preview
          </div>
          <div className="inline-flex h-10 items-center gap-2 border border-border-default bg-bg-canvas px-4 text-caption font-medium uppercase tracking-[0.12em] text-text-primary">
            <Instagram className="h-4 w-4" strokeWidth={1.5} />
            Watch on Instagram
          </div>
          <p className="mt-2 truncate text-caption text-text-muted">{trimmed}</p>
        </div>
      ) : null}
    </div>
  );
}
