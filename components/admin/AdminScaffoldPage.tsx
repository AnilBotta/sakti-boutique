import type { ReactNode } from 'react';
import { AdminPageHeader } from './AdminPageHeader';

interface AdminScaffoldPageProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/**
 * Standard wrapper for admin section pages. Provides the consistent page
 * header + content rhythm so every admin route feels like part of the same
 * internal tool.
 */
export function AdminScaffoldPage({
  eyebrow,
  title,
  description,
  actions,
  children,
}: AdminScaffoldPageProps) {
  return (
    <div className="flex flex-col">
      <AdminPageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={actions}
      />
      <div className="flex flex-col gap-6">{children}</div>
    </div>
  );
}
