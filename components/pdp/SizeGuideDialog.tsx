'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { SizeGuideRow } from '@/lib/catalog/product-details';

interface SizeGuideDialogProps {
  open: boolean;
  onClose: () => void;
  note: string;
  rows: SizeGuideRow[];
}

export function SizeGuideDialog({ open, onClose, note, rows }: SizeGuideDialogProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-title"
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center"
    >
      <button
        type="button"
        aria-label="Close size guide"
        onClick={onClose}
        className="absolute inset-0 bg-text-primary/40 backdrop-blur-[2px]"
      />
      <div className="relative z-10 w-full max-w-xl bg-bg-canvas shadow-lift md:mx-4">
        <div className="flex items-center justify-between border-b border-border-hairline px-6 py-5">
          <h2
            id="size-guide-title"
            className="text-body-lg font-medium text-text-primary"
          >
            Size Guide
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center text-text-secondary transition-colors duration-fast ease-standard hover:text-text-primary"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-6 py-6">
          <p className="mb-5 text-caption text-text-secondary">{note}</p>

          {rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-caption nums-tabular">
                <thead>
                  <tr className="border-b border-border-hairline text-left text-text-secondary">
                    <th className="py-3 pr-4 font-medium uppercase tracking-[0.12em]">Size</th>
                    <th className="py-3 pr-4 font-medium uppercase tracking-[0.12em]">Bust</th>
                    <th className="py-3 pr-4 font-medium uppercase tracking-[0.12em]">Waist</th>
                    <th className="py-3 font-medium uppercase tracking-[0.12em]">Hip</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.size} className="border-b border-border-hairline last:border-0">
                      <td className="py-3 pr-4 font-medium text-text-primary">{r.size}</td>
                      <td className="py-3 pr-4 text-text-secondary">{r.bust}</td>
                      <td className="py-3 pr-4 text-text-secondary">{r.waist}</td>
                      <td className="py-3 text-text-secondary">{r.hip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
