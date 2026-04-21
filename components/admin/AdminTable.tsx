import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface AdminColumn<Row> {
  key: string;
  header: ReactNode;
  cell: (row: Row) => ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
  /** Hide on narrow screens (table view only). */
  hideOn?: 'sm' | 'md';
  /**
   * Marks the identity column used as the card title in the mobile
   * stacked fallback. Exactly one column per table should set this;
   * if none do, the first column is used.
   */
  primary?: boolean;
  /** Skip this column entirely in the mobile card fallback. */
  mobileHidden?: boolean;
}

interface AdminTableProps<Row> {
  columns: AdminColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  empty?: ReactNode;
  className?: string;
  /** Optional per-row click/nav target used by the mobile card fallback. */
  rowHref?: (row: Row) => string | undefined;
}

/**
 * Shared admin list primitive.
 *
 * - ≥ md: renders a dense table — hairline borders, 48px rows, 40px header.
 *   Columns flagged `hideOn: 'sm' | 'md'` collapse to keep the table readable.
 * - < md: renders the SAME rows as a stacked card list. The column marked
 *   `primary` becomes the card title; remaining columns stack as
 *   label + value pairs. Columns flagged `mobileHidden` are skipped.
 *
 * Every admin listing page (products, orders, customers, reviews, etc.)
 * should reuse this primitive instead of re-solving mobile layout.
 */
export function AdminTable<Row>({
  columns,
  rows,
  rowKey,
  empty,
  className,
  rowHref,
}: AdminTableProps<Row>) {
  if (rows.length === 0 && empty) {
    return <div className="px-6 py-12">{empty}</div>;
  }

  const primaryCol =
    columns.find((c) => c.primary) ?? columns[0];
  const secondaryCols = columns.filter(
    (c) => c !== primaryCol && !c.mobileHidden,
  );

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop / tablet: table */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="w-full border-collapse text-caption">
          <thead>
            <tr className="border-b border-border-hairline text-left">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'h-10 px-4 text-[11px] font-medium uppercase tracking-[0.12em] text-text-secondary',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.hideOn === 'sm' && 'hidden sm:table-cell',
                    col.hideOn === 'md' && 'hidden md:table-cell',
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                className="border-b border-border-hairline last:border-b-0 transition-colors duration-fast ease-standard hover:bg-bg-subtle"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'h-12 px-4 align-middle text-body text-text-primary',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                      col.hideOn === 'sm' && 'hidden sm:table-cell',
                      col.hideOn === 'md' && 'hidden md:table-cell',
                      col.className,
                    )}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked card list */}
      <ul className="md:hidden divide-y divide-border-hairline" role="list">
        {rows.map((row) => {
          const href = rowHref?.(row);
          const inner = (
            <div className="flex flex-col gap-3 px-4 py-4">
              <div className="text-body text-text-primary font-medium">
                {primaryCol.cell(row)}
              </div>
              {secondaryCols.length > 0 && (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {secondaryCols.map((col) => (
                    <div key={col.key} className="flex flex-col gap-1 min-w-0">
                      <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
                        {col.header}
                      </dt>
                      <dd
                        className={cn(
                          'text-caption text-text-primary truncate',
                          col.align === 'right' && 'text-right',
                        )}
                      >
                        {col.cell(row)}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          );
          return (
            <li key={rowKey(row)}>
              {href ? (
                <a
                  href={href}
                  className="block transition-colors duration-fast ease-standard hover:bg-bg-subtle focus-visible:outline-none focus-visible:bg-bg-subtle"
                >
                  {inner}
                </a>
              ) : (
                inner
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
