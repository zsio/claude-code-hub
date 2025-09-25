import { z } from 'zod';
import { PROVIDER_LIMITS, PROVIDER_DEFAULTS } from '@/lib/constants/provider.constants';
import { USER_LIMITS, USER_DEFAULTS } from '@/lib/constants/user.constants';

/**
 * 用户创建数据验证schema
 */
export const CreateUserSchema = z.object({
  name: z
    .string()
    .min(1, "用户名不能为空")
    .max(64, "用户名不能超过64个字符")
    .regex(
      /^[a-zA-Z0-9_\u4e00-\u9fff-]+$/,
      "用户名只能包含字母、数字、下划线和中文",
    ),
  note: z.string().max(200, "备注不能超过200个字符").optional().default(""),
  rpm: z
    .coerce
    .number()
    .int("RPM必须是整数")
    .min(USER_LIMITS.RPM.MIN, `RPM不能低于${USER_LIMITS.RPM.MIN}`)
    .max(USER_LIMITS.RPM.MAX, `RPM不能超过${USER_LIMITS.RPM.MAX}`)
    .optional()
    .default(USER_DEFAULTS.RPM),
  dailyQuota: z
    .coerce
    .number()
    .min(USER_LIMITS.DAILY_QUOTA.MIN, `每日额度不能低于${USER_LIMITS.DAILY_QUOTA.MIN}美元`)
    .max(USER_LIMITS.DAILY_QUOTA.MAX, `每日额度不能超过${USER_LIMITS.DAILY_QUOTA.MAX}美元`)
    .optional()
    .default(USER_DEFAULTS.DAILY_QUOTA),
});

/**
 * 用户更新数据验证schema
 */
export const UpdateUserSchema = z.object({
  name: z
    .string()
    .min(1, "用户名不能为空")
    .max(64, "用户名不能超过64个字符")
    .regex(
      /^[a-zA-Z0-9_\u4e00-\u9fff-]+$/,
      "用户名只能包含字母、数字、下划线和中文",
    )
    .optional(),
  note: z.string().max(200, "备注不能超过200个字符").optional(),
  rpm: z
    .coerce
    .number()
    .int("RPM必须是整数")
    .min(USER_LIMITS.RPM.MIN, `RPM不能低于${USER_LIMITS.RPM.MIN}`)
    .max(USER_LIMITS.RPM.MAX, `RPM不能超过${USER_LIMITS.RPM.MAX}`)
    .optional(),
  dailyQuota: z
    .coerce
    .number()
    .min(USER_LIMITS.DAILY_QUOTA.MIN, `每日额度不能低于${USER_LIMITS.DAILY_QUOTA.MIN}美元`)
    .max(USER_LIMITS.DAILY_QUOTA.MAX, `每日额度不能超过${USER_LIMITS.DAILY_QUOTA.MAX}美元`)
    .optional(),
});

/**
 * 密钥表单数据验证schema
 */
export const KeyFormSchema = z.object({
  name: z
    .string()
    .min(1, "密钥名称不能为空")
    .max(64, "密钥名称不能超过64个字符")
    .regex(/^[a-zA-Z0-9_-]+$/, "密钥名称只能包含字母、数字、下划线和连字符"),
  expiresAt: z
    .string()
    .optional()
    .default("")
    .transform((val) => (val === "" ? undefined : val)),
});

/**
 * 服务商创建数据验证schema
 */
export const CreateProviderSchema = z.object({
  name: z
    .string()
    .min(1, "服务商名称不能为空")
    .max(64, "服务商名称不能超过64个字符"),
  url: z
    .string()
    .url("请输入有效的URL地址")
    .max(255, "URL长度不能超过255个字符"),
  key: z
    .string()
    .min(1, "API密钥不能为空")
    .max(255, "API密钥长度不能超过255个字符"),
  // 数据库字段命名：下划线
  is_enabled: z.boolean().optional().default(PROVIDER_DEFAULTS.IS_ENABLED),
  weight: z
    .number()
    .int()
    .min(PROVIDER_LIMITS.WEIGHT.MIN)
    .max(PROVIDER_LIMITS.WEIGHT.MAX)
    .optional()
    .default(PROVIDER_DEFAULTS.WEIGHT),
  tpm: z
    .number()
    .int()
    .min(PROVIDER_LIMITS.TPM.MIN)
    .max(PROVIDER_LIMITS.TPM.MAX)
    .nullable()
    .optional(),
  rpm: z
    .number()
    .int()
    .min(PROVIDER_LIMITS.RPM.MIN)
    .max(PROVIDER_LIMITS.RPM.MAX)
    .nullable()
    .optional(),
  rpd: z
    .number()
    .int()
    .min(PROVIDER_LIMITS.RPD.MIN)
    .max(PROVIDER_LIMITS.RPD.MAX)
    .nullable()
    .optional(),
  cc: z
    .number()
    .int()
    .min(PROVIDER_LIMITS.CC.MIN)
    .max(PROVIDER_LIMITS.CC.MAX)
    .nullable()
    .optional(),
});

/**
 * 服务商更新数据验证schema
 */
export const UpdateProviderSchema = z
  .object({
    name: z.string().min(1).max(64).optional(),
    url: z.string().url().max(255).optional(),
    key: z.string().min(1).max(255).optional(),
    is_enabled: z.boolean().optional(),
    weight: z
      .number()
      .int()
      .min(PROVIDER_LIMITS.WEIGHT.MIN)
      .max(PROVIDER_LIMITS.WEIGHT.MAX)
      .optional(),
    tpm: z
      .number()
      .int()
      .min(PROVIDER_LIMITS.TPM.MIN)
      .max(PROVIDER_LIMITS.TPM.MAX)
      .nullable()
      .optional(),
    rpm: z
      .number()
      .int()
      .min(PROVIDER_LIMITS.RPM.MIN)
      .max(PROVIDER_LIMITS.RPM.MAX)
      .nullable()
      .optional(),
    rpd: z
      .number()
      .int()
      .min(PROVIDER_LIMITS.RPD.MIN)
      .max(PROVIDER_LIMITS.RPD.MAX)
      .nullable()
      .optional(),
    cc: z
      .number()
      .int()
      .min(PROVIDER_LIMITS.CC.MIN)
      .max(PROVIDER_LIMITS.CC.MAX)
      .nullable()
      .optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: "更新内容为空" });

// 导出类型推断
