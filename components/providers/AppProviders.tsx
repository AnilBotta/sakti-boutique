'use client';

import type { ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';

/**
 * Single composition root for all client providers.
 * Add future providers (auth, cart, toast) here so the root layout stays clean.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
