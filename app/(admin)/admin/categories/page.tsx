'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Pencil, RotateCcw, Lock } from 'lucide-react';
import { AdminScaffoldPage } from '@/components/admin/AdminScaffoldPage';
import { AdminSectionCard } from '@/components/admin/AdminSectionCard';
import { taxonomy, audiences } from '@/lib/catalog/taxonomy';
import { categoryImage } from '@/lib/catalog/category-imagery';
import {
  useCategoryOverrides,
  upsertCategoryOverride,
  clearCategoryOverride,
} from '@/lib/admin/local-repo/categories';

interface EditorState {
  audience: string;
  category: string;
  label: string;
  image: string;
}

export default function AdminCategoriesPage() {
  const [overrides] = useCategoryOverrides();
  const [editor, setEditor] = useState<EditorState | null>(null);

  const overrideFor = (audience: string, category: string) =>
    overrides.find((o) => o.key === `${audience}/${category}`);

  const openEditor = (audience: string, category: string, defaultLabel: string) => {
    const o = overrideFor(audience, category);
    setEditor({
      audience,
      category,
      label: o?.label ?? defaultLabel,
      image: o?.image ?? categoryImage(audience, category),
    });
  };

  const saveEditor = () => {
    if (!editor) return;
    upsertCategoryOverride(editor.audience, editor.category, {
      label: editor.label,
      image: editor.image,
    });
    setEditor(null);
  };

  const resetCategory = (audience: string, category: string) => {
    if (!confirm('Reset to default label and banner image?')) return;
    clearCategoryOverride(audience, category);
  };

  return (
    <AdminScaffoldPage
      eyebrow="Catalog"
      title="Categories"
      description="The locked taxonomy. Customize display labels and banner images per category. Top-level structure changes require business approval."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {audiences.map((slug) => {
          const a = taxonomy[slug];
          return (
            <AdminSectionCard
              key={slug}
              title={a.label}
              description={`${a.categories.length} categories`}
              bodyClassName="p-0"
            >
              <ul className="divide-y divide-border-hairline">
                {a.categories.map((cat) => {
                  const o = overrideFor(slug, cat.slug);
                  const displayLabel = o?.label ?? cat.label;
                  const displayImage = o?.image ?? categoryImage(slug, cat.slug);
                  return (
                    <li
                      key={cat.slug}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden bg-bg-muted">
                        <Image
                          src={displayImage}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-body font-medium text-text-primary">
                          {displayLabel}
                        </p>
                        <p className="truncate text-caption text-text-muted">
                          /{slug}/{cat.slug}
                          {cat.subcategories.length > 0 && (
                            <span> · {cat.subcategories.length} subs</span>
                          )}
                          {o && (
                            <span className="ml-2 text-accent-ember">
                              · customized
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditor(slug, cat.slug, cat.label)}
                          aria-label="Edit"
                          title="Edit label and banner"
                          className="inline-flex h-8 w-8 items-center justify-center border border-border-hairline text-text-secondary hover:bg-bg-subtle hover:text-text-primary"
                        >
                          <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                        {o && (
                          <button
                            type="button"
                            onClick={() => resetCategory(slug, cat.slug)}
                            aria-label="Reset"
                            title="Reset to default"
                            className="inline-flex h-8 w-8 items-center justify-center border border-border-hairline text-text-secondary hover:bg-bg-subtle hover:text-accent-ember"
                          >
                            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </AdminSectionCard>
          );
        })}
      </div>

      <div className="flex items-start gap-3 border border-border-hairline bg-bg-subtle px-5 py-4 text-caption text-text-secondary">
        <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-text-muted" strokeWidth={1.5} />
        <p>
          Top-level categories and subcategories are locked at the platform
          level (see <code>01-product-brief.md</code>). To add or remove a
          category, request business approval first.
        </p>
      </div>

      {editor && (
        <CategoryEditorSheet
          editor={editor}
          onChange={setEditor}
          onSave={saveEditor}
          onClose={() => setEditor(null)}
        />
      )}
    </AdminScaffoldPage>
  );
}

function CategoryEditorSheet({
  editor,
  onChange,
  onSave,
  onClose,
}: {
  editor: EditorState;
  onChange: (next: EditorState) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="flex-1 bg-[rgba(15,15,15,0.4)]"
      />
      <aside className="flex h-full w-full max-w-md flex-col bg-bg-canvas shadow-float">
        <header className="flex items-center justify-between border-b border-border-hairline px-6 py-4">
          <div>
            <p className="eyebrow text-text-muted">Edit category</p>
            <p className="mt-1 text-body-lg font-medium text-text-primary">
              {editor.audience}/{editor.category}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-caption text-text-secondary hover:text-text-primary"
          >
            Close
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
          <label className="flex flex-col gap-1.5">
            <span className="eyebrow text-text-secondary">Display label</span>
            <input
              value={editor.label}
              onChange={(e) =>
                onChange({ ...editor, label: e.target.value })
              }
              className="h-10 border border-border-default bg-bg-canvas px-3 text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-ember focus:ring-offset-2"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="eyebrow text-text-secondary">Banner image URL</span>
            <input
              value={editor.image}
              onChange={(e) =>
                onChange({ ...editor, image: e.target.value })
              }
              placeholder="https://…"
              className="h-10 border border-border-default bg-bg-canvas px-3 text-caption text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-ember focus:ring-offset-2"
            />
          </label>

          <div>
            <p className="eyebrow mb-2 text-text-muted">Preview</p>
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-bg-muted">
              {editor.image && (
                <Image
                  src={editor.image}
                  alt={editor.label}
                  fill
                  sizes="400px"
                  className="object-cover"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4">
                <p className="text-body-lg font-medium text-bg-canvas">
                  {editor.label || 'Untitled'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-border-hairline px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 border border-border-default px-4 text-caption font-medium uppercase tracking-[0.12em] text-text-primary hover:bg-bg-subtle"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="h-10 bg-accent-ember px-4 text-caption font-medium uppercase tracking-[0.12em] text-bg-canvas hover:opacity-90"
          >
            Save
          </button>
        </footer>
      </aside>
    </div>
  );
}
