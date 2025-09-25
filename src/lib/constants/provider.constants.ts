/**
 * 供应商配置相关常量
 */
export const PROVIDER_LIMITS = {
  WEIGHT: { MIN: 0, MAX: 100 },
  TPM: { MIN: 10_000, MAX: 3_000_000, STEP: 1000 },
  RPM: { MIN: 1, MAX: 500 },
  RPD: { MIN: 1, MAX: 5_000 },
  CC: { MIN: 1, MAX: 200 },
} as const;

export const PROVIDER_DEFAULTS = {
  IS_ENABLED: false,
  WEIGHT: 1,
  TPM: 10_000,
  RPM: 1,
  RPD: 1,
  CC: 1,
} as const;
