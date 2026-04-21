import type { ReactNode } from 'react';

/**
 * Customer account section. Auth gating, sidebar, and tabs land in a later step.
 * For now this just nests inside the storefront layout.
 */
export default function AccountLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
