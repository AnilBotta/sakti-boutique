'use client';

import { ChevronDown } from 'lucide-react';
import type { SortKey } from '@/lib/catalog/facets';

interface SortMenuProps {
  value: SortKey;
  onChange: (value: SortKey) => void;
}

const options: { value: SortKey; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'best-sellers', label: 'Best Sellers' },
  { value: 'price-asc', label: 'Price · Low to High' },
  { value: 'price-desc', label: 'Price · High to Low' },
];

export function SortMenu({ value, onChange }: SortMenuProps) {
  return (
    <label className="relative inline-flex h-11 items-center gap-2 rounded-md border border-border-hairline bg-bg-canvas px-4 text-caption uppercase tracking-[0.14em] text-text-secondary transition-colors duration-fast ease-standard hover:text-text-primary">
      <span className="text-text-muted">Sort</span>
      <select
        aria-label="Sort products"
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        className="cursor-pointer appearance-none bg-transparent pr-5 font-medium text-text-primary focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-text-muted" strokeWidth={1.5} />
    </label>
  );
}
