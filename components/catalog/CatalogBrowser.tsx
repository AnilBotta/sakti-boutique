'use client';

import { useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { Product } from '@/lib/catalog/products';
import {
  applyFilters,
  applySort,
  buildFacets,
  countActive,
  emptyFilters,
  type ActiveFilters,
  type SortKey,
} from '@/lib/catalog/facets';
import { Container } from '@/components/layout/Container';
import { ProductGrid } from '@/components/layout/ProductGrid';
import { ProductCard } from './ProductCard';
import { FilterPanel } from './FilterPanel';
import { FilterDrawer } from './FilterDrawer';
import { SortMenu } from './SortMenu';
import { EmptyState } from './EmptyState';

const PAGE_SIZE = 12;

interface CatalogBrowserProps {
  products: Product[];
}

/**
 * Client orchestrator: filters + sort + load-more, in-memory.
 * Wraps server-passed product fixtures. Replace data source with React Query
 * + Supabase in a later step without touching this component's contract.
 */
export function CatalogBrowser({ products }: CatalogBrowserProps) {
  const facets = useMemo(() => buildFacets(products), [products]);
  const [filters, setFilters] = useState<ActiveFilters>(emptyFilters);
  const [sort, setSort] = useState<SortKey>('new');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(
    () => applySort(applyFilters(products, filters), sort),
    [products, filters, sort],
  );

  const visibleProducts = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;
  const activeCount = countActive(filters);

  const reset = () => {
    setFilters(emptyFilters);
    setVisible(PAGE_SIZE);
  };

  return (
    <section className="py-12 md:py-16">
      <Container width="editorial">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Desktop sidebar */}
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24">
              <FilterPanel
                facets={facets}
                filters={filters}
                onChange={(f) => {
                  setFilters(f);
                  setVisible(PAGE_SIZE);
                }}
                onClear={reset}
              />
            </div>
          </aside>

          {/* Main */}
          <div className="lg:col-span-9">
            {/* Toolbar */}
            <div className="mb-8 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="inline-flex h-11 items-center gap-2 rounded-md border border-border-hairline px-4 text-caption uppercase tracking-[0.14em] text-text-secondary lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
                Filters
                {activeCount > 0 && (
                  <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-ember px-1.5 text-eyebrow text-bg-canvas">
                    {activeCount}
                  </span>
                )}
              </button>

              <p className="hidden text-caption text-text-muted nums-tabular lg:block">
                {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}
              </p>

              <SortMenu
                value={sort}
                onChange={(v) => {
                  setSort(v);
                  setVisible(PAGE_SIZE);
                }}
              />
            </div>

            {visibleProducts.length === 0 ? (
              <EmptyState onReset={reset} />
            ) : (
              <>
                <ProductGrid>
                  {visibleProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </ProductGrid>

                {hasMore && (
                  <div className="mt-14 flex flex-col items-center gap-3">
                    <p className="text-caption text-text-muted nums-tabular">
                      Showing {visibleProducts.length} of {filtered.length}
                    </p>
                    <button
                      type="button"
                      onClick={() => setVisible((v) => v + PAGE_SIZE)}
                      className="inline-flex h-12 items-center rounded-md border border-text-primary px-8 text-button font-medium uppercase tracking-[0.02em] text-text-primary transition-colors duration-fast ease-standard hover:bg-text-primary hover:text-bg-canvas"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Container>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        facets={facets}
        filters={filters}
        onChange={(f) => {
          setFilters(f);
          setVisible(PAGE_SIZE);
        }}
        onClear={reset}
        resultCount={filtered.length}
      />
    </section>
  );
}
