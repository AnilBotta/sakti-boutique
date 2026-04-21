'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function PromoCodeField() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState(false);

  return (
    <div className="border-y border-border-hairline py-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-caption uppercase tracking-[0.14em] text-text-secondary transition-colors duration-fast ease-standard hover:text-text-primary"
      >
        <span>Have a promo code?</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-fast ease-standard',
            open && 'rotate-180',
          )}
          strokeWidth={1.5}
        />
      </button>
      {open && (
        <div className="mt-4 flex gap-2">
          <label htmlFor="promo-code" className="sr-only">
            Promo code
          </label>
          <input
            id="promo-code"
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setApplied(false);
            }}
            placeholder="Enter code"
            className="h-11 flex-1 border border-border-hairline bg-bg-canvas px-4 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-ember focus:ring-offset-2"
          />
          <button
            type="button"
            onClick={() => code.trim() && setApplied(true)}
            className="h-11 border border-text-primary px-5 text-caption font-medium uppercase tracking-[0.14em] text-text-primary transition-colors duration-fast ease-standard hover:bg-text-primary hover:text-bg-canvas"
          >
            Apply
          </button>
        </div>
      )}
      {applied && (
        <p className="mt-3 text-caption text-state-success">Code applied.</p>
      )}
    </div>
  );
}
