'use client';

import { useSyncExternalStore } from 'react';

/**
 * Versioned, type-safe localStorage collection with cross-tab sync.
 *
 * Design notes:
 * - Keys are namespaced under `sakthi:v1:<name>`.
 * - First access seeds from the provided default and returns it.
 * - A single `CustomEvent('sakthi:store')` fans out to in-tab subscribers;
 *   `storage` events handle cross-tab sync.
 * - SSR returns the seed; hydration reads localStorage.
 * - `useSyncExternalStore` requires `getSnapshot` to return a stable
 *   reference when data hasn't changed. We cache the parsed value per key
 *   and re-parse only when the raw string changes.
 * - Repository layer wraps this with domain-specific helpers (products,
 *   categories, etc). Swapping to Supabase is one repository at a time.
 */

const KEY_PREFIX = 'sakthi:v1:';

interface CacheEntry {
  raw: string | null;
  value: unknown;
}
const cache = new Map<string, CacheEntry>();

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function fullKey(name: string) {
  return `${KEY_PREFIX}${name}`;
}

function readRaw<T>(name: string, seed: T): T {
  if (!isBrowser()) return seed;
  try {
    const raw = window.localStorage.getItem(fullKey(name));
    if (raw === null) {
      writeRaw(name, seed);
      return readRaw(name, seed);
    }
    const cached = cache.get(name);
    if (cached && cached.raw === raw) {
      return cached.value as T;
    }
    const parsed = JSON.parse(raw) as T;
    cache.set(name, { raw, value: parsed });
    return parsed;
  } catch {
    return seed;
  }
}

function writeRaw<T>(name: string, value: T) {
  if (!isBrowser()) return;
  try {
    const raw = JSON.stringify(value);
    window.localStorage.setItem(fullKey(name), raw);
    cache.set(name, { raw, value });
    window.dispatchEvent(
      new CustomEvent('sakthi:store', { detail: { key: name } }),
    );
  } catch {
    // quota or private mode — silently ignore
  }
}

export function readCollection<T>(name: string, seed: T[]): T[] {
  return readRaw<T[]>(name, seed);
}

export function writeCollection<T>(name: string, value: T[]) {
  writeRaw<T[]>(name, value);
}

export function resetCollection<T>(name: string, seed: T[]) {
  writeRaw<T[]>(name, seed);
}

/**
 * React hook — subscribes to changes across tabs and within-tab writes.
 * Returns a tuple: [current value, setter that replaces the whole collection].
 */
export function useCollection<T>(
  name: string,
  seed: T[],
): [T[], (next: T[] | ((prev: T[]) => T[])) => void] {
  const subscribe = (cb: () => void) => {
    if (!isBrowser()) return () => {};
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail || detail.key === name) cb();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === fullKey(name)) cb();
    };
    window.addEventListener('sakthi:store', onCustom);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('sakthi:store', onCustom);
      window.removeEventListener('storage', onStorage);
    };
  };

  const getSnapshot = () => readRaw<T[]>(name, seed);
  const getServerSnapshot = () => seed;

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = (next: T[] | ((prev: T[]) => T[])) => {
    const resolved =
      typeof next === 'function'
        ? (next as (prev: T[]) => T[])(readRaw<T[]>(name, seed))
        : next;
    writeRaw<T[]>(name, resolved);
  };

  return [value, setValue];
}

/** Stable ID generator suitable for local-demo records. */
export function generateId(prefix = 'id'): string {
  const rand = Math.random().toString(36).slice(2, 8);
  const ts = Date.now().toString(36).slice(-4);
  return `${prefix}-${ts}${rand}`;
}
