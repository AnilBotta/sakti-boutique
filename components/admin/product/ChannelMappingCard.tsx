'use client';

import {
  AdminFieldRow,
  AdminInput,
  AdminToggle,
} from '@/components/admin/form';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import type { EditableProduct } from '@/lib/admin/product-editor';

interface ChannelMappingCardProps {
  product: EditableProduct;
  onChange: (patch: Partial<EditableProduct>) => void;
}

/**
 * Amazon channel mapping — secondary sales channel per product brief.
 * Shell only; no real sync, no real API calls.
 */
export function ChannelMappingCard({
  product,
  onChange,
}: ChannelMappingCardProps) {
  const setChannel = (patch: Partial<EditableProduct['channel']>) =>
    onChange({ channel: { ...product.channel, ...patch } });

  return (
    <div className="flex flex-col gap-5">
      <AdminToggle
        id="publish-amazon"
        label="Publish to Amazon"
        description="Enable the secondary Amazon channel for this product. Storefront remains primary."
        checked={product.channel.publishToAmazon}
        onChange={(n) => setChannel({ publishToAmazon: n })}
      />

      {product.channel.publishToAmazon && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <AdminFieldRow
              label="Amazon SKU"
              htmlFor="amazon-sku"
              helper="Sync identifier on the Amazon seller account."
            >
              <AdminInput
                id="amazon-sku"
                value={product.channel.amazonSku}
                onChange={(e) => setChannel({ amazonSku: e.target.value })}
                placeholder="AMZ-SKU-0001"
              />
            </AdminFieldRow>
            <AdminFieldRow
              label="ASIN"
              htmlFor="asin"
              helper="Populated automatically once the listing goes live."
            >
              <AdminInput
                id="asin"
                value={product.channel.asin}
                onChange={(e) => setChannel({ asin: e.target.value })}
                placeholder="B0CXX1234Z"
              />
            </AdminFieldRow>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border border-border-hairline bg-bg-subtle px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">
                Listing status
              </span>
              <AdminStatusBadge status={product.channel.listingStatus} />
            </div>
            <div className="text-caption text-text-muted">
              Last sync:{' '}
              <span className="text-text-secondary">
                {product.channel.lastSyncAt ?? 'never'}
              </span>
            </div>
          </div>

          {product.channel.lastSyncError && (
            <p className="border-l-2 border-accent-crimson bg-bg-subtle px-4 py-3 text-caption text-accent-crimson">
              {product.channel.lastSyncError}
            </p>
          )}

          <p className="text-caption text-text-muted">
            Sync runs through the channel mapping seam defined in the data
            model. Real publishing activates in a later step.
          </p>
        </>
      )}
    </div>
  );
}
