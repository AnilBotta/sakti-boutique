'use client';

import type { ActiveFilters, FacetCounts } from '@/lib/catalog/facets';
import { cn } from '@/lib/utils/cn';

interface FilterPanelProps {
  facets: FacetCounts;
  filters: ActiveFilters;
  onChange: (next: ActiveFilters) => void;
  onClear: () => void;
}

/**
 * Inner panel used by both desktop sidebar and mobile drawer.
 * Pure controlled component — parent owns state.
 */
export function FilterPanel({ facets, filters, onChange, onClear }: FilterPanelProps) {
  const toggle = (key: keyof Omit<ActiveFilters, 'priceMax'>, value: string) => {
    const current = filters[key];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next });
  };

  const setPriceMax = (priceMax: number | undefined) => {
    onChange({ ...filters, priceMax });
  };

  const priceBuckets = buildPriceBuckets(facets.priceRange.max);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <p className="eyebrow text-text-primary">Refine</p>
        <button
          type="button"
          onClick={onClear}
          className="text-caption text-text-muted underline-offset-4 hover:text-accent-ember hover:underline"
        >
          Clear all
        </button>
      </div>

      <FilterGroup label="Price">
        <ul className="flex flex-col gap-2">
          {priceBuckets.map((b) => {
            const active = filters.priceMax === b.value;
            return (
              <li key={b.label}>
                <button
                  type="button"
                  onClick={() => setPriceMax(active ? undefined : b.value)}
                  className={cn(
                    'flex w-full items-center justify-between py-1.5 text-body transition-colors duration-fast ease-standard',
                    active ? 'text-accent-ember' : 'text-text-secondary hover:text-text-primary',
                  )}
                >
                  <span>{b.label}</span>
                  {active && <span aria-hidden>✓</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </FilterGroup>

      <FacetGroup
        label="Size"
        items={facets.sizes}
        selected={filters.sizes}
        onToggle={(v) => toggle('sizes', v)}
      />
      <FacetGroup
        label="Color"
        items={facets.colors}
        selected={filters.colors}
        onToggle={(v) => toggle('colors', v)}
      />
      <FacetGroup
        label="Fabric"
        items={facets.fabrics}
        selected={filters.fabrics}
        onToggle={(v) => toggle('fabrics', v)}
      />
      <FacetGroup
        label="Occasion"
        items={facets.occasions}
        selected={filters.occasions}
        onToggle={(v) => toggle('occasions', v)}
      />
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-border-hairline pt-6">
      <legend className="eyebrow mb-4 text-text-primary">{label}</legend>
      {children}
    </fieldset>
  );
}

function FacetGroup({
  label,
  items,
  selected,
  onToggle,
}: {
  label: string;
  items: { value: string; count: number }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <FilterGroup label={label}>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => {
          const active = selected.includes(item.value);
          return (
            <li key={item.value}>
              <button
                type="button"
                onClick={() => onToggle(item.value)}
                className={cn(
                  'inline-flex h-9 items-center rounded-md border px-3.5 text-caption transition-colors duration-fast ease-standard',
                  active
                    ? 'border-accent-ember bg-bg-muted text-accent-ember'
                    : 'border-border-hairline text-text-secondary hover:text-text-primary',
                )}
              >
                {item.value}
                <span className="ml-1.5 text-text-muted nums-tabular">{item.count}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </FilterGroup>
  );
}

function buildPriceBuckets(max: number) {
  const ceil = Math.ceil(max / 100) * 100;
  const buckets: { label: string; value: number }[] = [];
  if (ceil <= 200) {
    buckets.push({ label: 'Under $100', value: 100 });
    buckets.push({ label: 'Under $200', value: 200 });
  } else {
    buckets.push({ label: 'Under $150', value: 150 });
    buckets.push({ label: 'Under $300', value: 300 });
    buckets.push({ label: 'Under $500', value: 500 });
    if (ceil > 500) buckets.push({ label: `Under $${ceil}`, value: ceil });
  }
  return buckets;
}
