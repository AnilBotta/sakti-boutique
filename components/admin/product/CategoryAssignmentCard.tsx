'use client';

import { AdminFieldRow, AdminSelect } from '@/components/admin/form';
import { taxonomy, type Audience } from '@/lib/catalog/taxonomy';
import type { EditableProduct } from '@/lib/admin/product-editor';

interface CategoryAssignmentCardProps {
  product: EditableProduct;
  onChange: (patch: Partial<EditableProduct>) => void;
}

/**
 * Reads from the locked taxonomy. Audience → Category → Subcategory
 * cascade is the only valid assignment path.
 */
export function CategoryAssignmentCard({
  product,
  onChange,
}: CategoryAssignmentCardProps) {
  const audienceNode = taxonomy[product.audience];
  const categoryNode = audienceNode.categories.find(
    (c) => c.slug === product.category,
  );
  const subcategories = categoryNode?.subcategories ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <AdminFieldRow label="Audience" htmlFor="audience" required>
          <AdminSelect
            id="audience"
            value={product.audience}
            onChange={(e) => {
              const nextAudience = e.target.value as Audience;
              const firstCat = taxonomy[nextAudience].categories[0];
              onChange({
                audience: nextAudience,
                category: firstCat.slug,
                subcategory: firstCat.subcategories[0]?.slug,
              });
            }}
          >
            {(Object.keys(taxonomy) as Audience[]).map((a) => (
              <option key={a} value={a}>
                {taxonomy[a].label}
              </option>
            ))}
          </AdminSelect>
        </AdminFieldRow>

        <AdminFieldRow label="Category" htmlFor="category" required>
          <AdminSelect
            id="category"
            value={product.category}
            onChange={(e) => {
              const nextCat = audienceNode.categories.find(
                (c) => c.slug === e.target.value,
              );
              onChange({
                category: e.target.value,
                subcategory: nextCat?.subcategories[0]?.slug,
              });
            }}
          >
            {audienceNode.categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </AdminSelect>
        </AdminFieldRow>

        <AdminFieldRow
          label="Subcategory"
          htmlFor="subcategory"
          helper={
            subcategories.length === 0
              ? 'No subcategories in this category.'
              : undefined
          }
        >
          <AdminSelect
            id="subcategory"
            value={product.subcategory ?? ''}
            disabled={subcategories.length === 0}
            onChange={(e) =>
              onChange({ subcategory: e.target.value || undefined })
            }
          >
            <option value="">—</option>
            {subcategories.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.label}
              </option>
            ))}
          </AdminSelect>
        </AdminFieldRow>
      </div>
      <p className="text-caption text-text-muted">
        Taxonomy is locked per brand guidelines. Adding new top-level categories
        requires business approval.
      </p>
    </div>
  );
}
