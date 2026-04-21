'use client';

import {
  AdminFieldRow,
  AdminInput,
  AdminTextarea,
} from '@/components/admin/form';
import type { EditableProduct } from '@/lib/admin/product-editor';

interface BasicInfoCardProps {
  product: EditableProduct;
  onChange: (patch: Partial<EditableProduct>) => void;
}

export function BasicInfoCard({ product, onChange }: BasicInfoCardProps) {
  return (
    <div className="flex flex-col gap-5">
      <AdminFieldRow label="Product name" htmlFor="name" required>
        <AdminInput
          id="name"
          value={product.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Aanya Hand-Embroidered Kurthi Set"
        />
      </AdminFieldRow>

      <AdminFieldRow
        label="Description"
        htmlFor="description"
        helper="Displayed on the product detail page. Keep it editorial and specific."
      >
        <AdminTextarea
          id="description"
          rows={5}
          value={product.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Hand-finished in small batches. Cut from breathable fabrics…"
        />
      </AdminFieldRow>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <AdminFieldRow label="Fabric" htmlFor="fabric">
          <AdminInput
            id="fabric"
            value={product.fabric}
            onChange={(e) => onChange({ fabric: e.target.value })}
            placeholder="Handloom cotton"
          />
        </AdminFieldRow>
        <AdminFieldRow label="Care instructions" htmlFor="care">
          <AdminInput
            id="care"
            value={product.care}
            onChange={(e) => onChange({ care: e.target.value })}
            placeholder="Dry clean recommended"
          />
        </AdminFieldRow>
      </div>
    </div>
  );
}
