/**
 * 用户数据库实体类型
 */
export interface User {
  id: number;
  name: string;
  description: string;
  role: "admin" | "user";
  rpm: number; // 每分钟请求数限制
  dailyQuota: number; // 每日额度限制（美元）
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * 用户创建数据
 */
export interface CreateUserData {
  name: string;
  description: string;
  rpm?: number; // 可选，有默认值
  dailyQuota?: number; // 可选，有默认值
}

/**
 * 用户更新数据
 */
export interface UpdateUserData {
  name?: string;
  description?: string;
  rpm?: number;
  dailyQuota?: number;
}

/**
 * 用户密钥显示对象
 */
export interface UserKeyDisplay {
  id: number;
  name: string;
  maskedKey: string;
  fullKey?: string; // 仅管理员可见的完整密钥
  canCopy: boolean; // 是否可以复制完整密钥
  expiresAt: string; // 格式化后的日期字符串或"永不过期"
  status: "enabled" | "disabled";
  todayUsage: number; // 今日消耗金额（美元）
  createdAt: Date; // 创建时间
  createdAtFormatted: string; // 格式化后的具体时间
}

/**
 * 用户显示对象（用于前端组件）
 */
export interface UserDisplay {
  id: number;
  name: string;
  note?: string;
  role: "admin" | "user";
  rpm: number;
  dailyQuota: number;
  keys: UserKeyDisplay[];
}

/**
 * 用户表单数据
 */
