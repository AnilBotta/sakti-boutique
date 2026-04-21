// Motion tokens — single source of truth for durations and easings.
// See .claude/rules/02b-motion-and-interaction-rules.md

export const duration = {
  instant: 0.12,
  fast: 0.2,
  base: 0.32,
  slow: 0.56,
  cinematic: 0.9,
  settle: 1.2,
} as const;

export const ease = {
  standard: [0.22, 0.61, 0.36, 1] as const,
  entrance: [0.16, 1, 0.3, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
  settle: [0.65, 0, 0.35, 1] as const,
};

export const viewportOnce = { once: true, amount: 0.15 } as const;
