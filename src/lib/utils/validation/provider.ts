import { PROVIDER_LIMITS } from "@/lib/constants/provider.constants";

/**
 * 数字字段验证：要么不填（null），要么是大于0的整数
 */
export function validateNumericField(value: string): number | null {
  if (!value.trim()) return null;
  const num = parseInt(value, 10);
  return num > 0 ? num : null;
}

/**
 * 限制权重值在有效范围内
 */
export function clampWeight(value: number): number {
  if (Number.isNaN(value)) return PROVIDER_LIMITS.WEIGHT.MIN;
  return Math.max(
    PROVIDER_LIMITS.WEIGHT.MIN,
    Math.min(PROVIDER_LIMITS.WEIGHT.MAX, Math.round(value))
  );
}

/**
 * 限制整数在指定范围内
 */
export function clampIntInRange(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

/**
 * 限制TPM值并取整到千位
 */
export function clampTpm(value: number): number {
  const safeValue = Number.isNaN(value) ? PROVIDER_LIMITS.TPM.MIN : value;
  const rounded = Math.round(safeValue / PROVIDER_LIMITS.TPM.STEP) * PROVIDER_LIMITS.TPM.STEP;
  return clampIntInRange(rounded, PROVIDER_LIMITS.TPM.MIN, PROVIDER_LIMITS.TPM.MAX);
}

/**
 * 格式化TPM显示值
 */
export function formatTpmDisplay(value: number, infinite: boolean): string {
  if (infinite) return "∞";
  const k = value / 1000;
  if (k >= 1000) {
    const m = k / 1000;
    return Number.isInteger(m) ? `${m}M` : `${m.toFixed(1)}M`;
  }
  return `${Math.round(k)}K`;
}
