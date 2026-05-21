import { AdminScaffoldPage } from '@/components/admin/AdminScaffoldPage';
import { AdminSectionCard } from '@/components/admin/AdminSectionCard';
import { Lock } from 'lucide-react';
import { listCategoryTree } from '@/lib/repositories/categories';
import { CategoriesClient } from './CategoriesClient';

export default async function AdminCategoriesPage() {
  const tree = await listCategoryTree();

  return (
    <AdminScaffoldPage
      eyebrow="Catalog"
      title="Categories"
      description="The locked taxonomy. Customize display labels and banner images per category. Top-level structure changes require business approval."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {tree.map((aud) => (
          <AdminSectionCard
            key={aud.audience}
            title={aud.label}
            description={`${aud.categories.length} categories`}
            bodyClassName="p-0"
          >
            <CategoriesClient
              audience={aud.audience}
              categories={aud.categories}
            />
          </AdminSectionCard>
        ))}
      </div>

      <div className="flex items-start gap-3 border border-border-hairline bg-bg-subtle px-5 py-4 text-caption text-text-secondary">
        <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-text-muted" strokeWidth={1.5} />
        <p>
          Top-level categories and subcategories are locked at the platform
          level (see <code>01-product-brief.md</code>). To add or remove a
          category, request business approval first.
        </p>
      </div>
    </AdminScaffoldPage>
  );
}
