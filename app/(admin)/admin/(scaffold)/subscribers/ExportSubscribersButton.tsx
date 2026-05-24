'use client';

import { Download } from 'lucide-react';
import type { NewsletterSubscriber } from '@/lib/repositories/newsletter';

interface Props {
  subscribers: NewsletterSubscriber[];
  disabled?: boolean;
}

/**
 * Trigger a CSV download of the active subscriber list.
 *
 * We build the CSV in the browser from the rows already rendered server-
 * side, so the download is instant and works offline. Quoting follows
 * RFC 4180 — every field is wrapped in double quotes and embedded
 * quotes are doubled.
 */
function csvEscape(value: string): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export function ExportSubscribersButton({ subscribers, disabled }: Props) {
  function download() {
    const header = ['email', 'source', 'subscribed_at'];
    const rows = subscribers.map((s) =>
      [s.email, s.source, s.subscribedAt].map(csvEscape).join(','),
    );
    const csv = [header.join(','), ...rows].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `sakthi-subscribers-${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      disabled={disabled}
      className="inline-flex h-11 items-center gap-2 border border-border-default bg-bg-canvas px-5 text-caption font-medium uppercase tracking-[0.12em] text-text-primary transition-colors duration-fast ease-standard hover:bg-bg-subtle disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Download className="h-4 w-4" strokeWidth={1.5} />
      Export CSV
    </button>
  );
}
