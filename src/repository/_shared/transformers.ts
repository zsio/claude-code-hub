import type { User } from "@/types/user";
import type { Key } from "@/types/key";
import type { Provider } from "@/types/provider";
import type { MessageRequest } from "@/types/message";
import type { ModelPrice } from "@/types/model-price";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toUser(dbUser: any): User {
  return {
    ...dbUser,
    description: dbUser?.description || "",
    role: (dbUser?.role as User["role"]) || "user",
    rpm: dbUser?.rpm || 60,
    createdAt: dbUser?.createdAt ? new Date(dbUser.createdAt) : new Date(),
    updatedAt: dbUser?.updatedAt ? new Date(dbUser.updatedAt) : new Date(),
    dailyQuota: dbUser?.dailyQuota ? parseFloat(dbUser.dailyQuota) : 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toKey(dbKey: any): Key {
  return {
    ...dbKey,
    isEnabled: dbKey?.isEnabled ?? true,
    createdAt: dbKey?.createdAt ? new Date(dbKey.createdAt) : new Date(),
    updatedAt: dbKey?.updatedAt ? new Date(dbKey.updatedAt) : new Date(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toProvider(dbProvider: any): Provider {
  return {
    ...dbProvider,
    isEnabled: dbProvider?.isEnabled ?? true,
    weight: dbProvider?.weight ?? 1,
    tpm: dbProvider?.tpm ?? null,
    rpm: dbProvider?.rpm ?? null,
    rpd: dbProvider?.rpd ?? null,
    cc: dbProvider?.cc ?? null,
    createdAt: dbProvider?.createdAt ? new Date(dbProvider.createdAt) : new Date(),
    updatedAt: dbProvider?.updatedAt ? new Date(dbProvider.updatedAt) : new Date(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toMessageRequest(dbMessage: any): MessageRequest {
  return {
    ...dbMessage,
    createdAt: dbMessage?.createdAt ? new Date(dbMessage.createdAt) : new Date(),
    updatedAt: dbMessage?.updatedAt ? new Date(dbMessage.updatedAt) : new Date(),
    costUsd: dbMessage?.costUsd != null ? parseFloat(dbMessage.costUsd) : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toModelPrice(dbPrice: any): ModelPrice {
  return {
    ...dbPrice,
    createdAt: dbPrice?.createdAt ? new Date(dbPrice.createdAt) : new Date(),
    updatedAt: dbPrice?.updatedAt ? new Date(dbPrice.updatedAt) : new Date(),
  };
}
