/**
 * 用户相关默认值与取值范围
 */
export const USER_DEFAULTS = {
  RPM: 100,
  DAILY_QUOTA: 100,
} as const;

export const USER_LIMITS = {
  RPM: {
    MIN: 1,
    MAX: 10_000,
  },
  DAILY_QUOTA: {
    MIN: 0.01,
    MAX: 1_000,
  },
} as const;
