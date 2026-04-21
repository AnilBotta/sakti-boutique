'use client';

import { AdminToggle } from '@/components/admin/form';
import type { EditableProduct } from '@/lib/admin/product-editor';

interface MerchandisingFlagsCardProps {
  product: EditableProduct;
  onChange: (patch: Partial<EditableProduct>) => void;
}

export function MerchandisingFlagsCard({
  product,
  onChange,
}: MerchandisingFlagsCardProps) {
  const setFlag = (key: keyof EditableProduct['flags'], next: boolean) =>
    onChange({ flags: { ...product.flags, [key]: next } });

  return (
    <div className="divide-y divide-border-hairline">
      <AdminToggle
        id="flag-featured"
        label="Featured"
        description="Surfaces on the homepage featured rail and brand storytelling blocks."
        checked={product.flags.featured}
        onChange={(n) => setFlag('featured', n)}
      />
      <AdminToggle
        id="flag-bestSeller"
        label="Best Seller"
        description="Shows a Best Seller badge on product cards. Use when sales data justifies."
        checked={product.flags.bestSeller}
        onChange={(n) => setFlag('bestSeller', n)}
      />
      <AdminToggle
        id="flag-new"
        label="New Arrival"
        description="Shows a New badge for the first 30 days after publish."
        checked={product.flags.newArrival}
        onChange={(n) => setFlag('newArrival', n)}
      />
    </div>
  );
}
