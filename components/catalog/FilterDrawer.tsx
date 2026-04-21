'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { FilterPanel } from './FilterPanel';
import type { ActiveFilters, FacetCounts } from '@/lib/catalog/facets';
import { cn } from '@/lib/utils/cn';

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  facets: FacetCounts;
  filters: ActiveFilters;
  onChange: (next: ActiveFilters) => void;
  onClear: () => void;
  resultCount: number;
}

export function FilterDrawer({
  open,
  onClose,
  facets,
  filters,
  onChange,
  onClear,
  resultCount,
}: FilterDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div
      aria-hidden={!open}
      className={cn(
        'fixed inset-0 z-50 lg:hidden',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      )}
    >
      <div
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-[rgba(15,15,15,0.4)] transition-opacity duration-fast ease-standard',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />
      <aside
        role="dialog"
        aria-label="Filters"
        className={cn(
          'absolute bottom-0 left-0 right-0 max-h-[88vh] rounded-t-xl bg-bg-canvas shadow-float',
          'flex flex-col transition-transform duration-base ease-standard',
          open ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <header className="flex h-14 items-center justify-between border-b border-border-hairline px-5">
          <p className="eyebrow text-text-primary">Filters</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex h-11 w-11 items-center justify-center"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          <FilterPanel
            facets={facets}
            filters={filters}
            onChange={onChange}
            onClear={onClear}
          />
        </div>

        <footer className="border-t border-border-hairline px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-12 w-full items-center justify-center rounded-md bg-accent-ember text-button font-medium uppercase tracking-[0.02em] text-bg-canvas active:scale-[0.985]"
          >
            Show {resultCount} {resultCount === 1 ? 'piece' : 'pieces'}
          </button>
        </footer>
      </aside>
    </div>
  );
}
