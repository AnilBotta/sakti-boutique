import type { ReactNode } from 'react';

interface AdminEmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function AdminEmptyState({ title, description, action }: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-body-lg font-medium text-text-primary">{title}</p>
      {description && (
        <p className="mt-2 max-w-sm text-caption text-text-muted">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
