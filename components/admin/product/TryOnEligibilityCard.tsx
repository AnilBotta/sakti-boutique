'use client';

import { Sparkles } from 'lucide-react';
import { AdminToggle } from '@/components/admin/form';
import type { EditableProduct } from '@/lib/admin/product-editor';

interface TryOnEligibilityCardProps {
  product: EditableProduct;
  onChange: (patch: Partial<EditableProduct>) => void;
}

export function TryOnEligibilityCard({
  product,
  onChange,
}: TryOnEligibilityCardProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 border border-border-hairline bg-bg-subtle px-4 py-3">
        <Sparkles
          className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-ember"
          strokeWidth={1.5}
        />
        <p className="text-caption text-text-secondary">
          Virtual Try-On is a first-class Sakthi feature. Enable it only for
          products with clean model photography and confirmed garment masks.
        </p>
      </div>
      <AdminToggle
        id="tryon-enabled"
        label="Enable Try Me on this product"
        description="Adds the Try Me CTA to the product detail page. Eligibility affects dashboard success metrics."
        checked={product.flags.tryOnEnabled}
        onChange={(n) =>
          onChange({ flags: { ...product.flags, tryOnEnabled: n } })
        }
      />
    </div>
  );
}
