"use server";

import { db } from "@/drizzle/db";
import { keys, users, messageRequest } from "@/drizzle/schema";
import { eq, isNull, and, or, gt, gte, lt, count, sum } from "drizzle-orm";
import type { Key, CreateKeyData, UpdateKeyData } from "@/types/key";
import type { User } from "@/types/user";
import { toKey, toUser } from "./_shared/transformers";

export async function findKeyById(id: number): Promise<Key | null> {
  const [key] = await db
    .select({
      id: keys.id,
      userId: keys.userId,
      key: keys.key,
      name: keys.name,
      isEnabled: keys.isEnabled,
      expiresAt: keys.expiresAt,
      createdAt: keys.createdAt,
      updatedAt: keys.updatedAt,
      deletedAt: keys.deletedAt,
    })
    .from(keys)
    .where(and(eq(keys.id, id), isNull(keys.deletedAt)));

  if (!key) return null;
  return toKey(key);
}

export async function findKeyList(userId: number): Promise<Key[]> {
  const result = await db
    .select({
      id: keys.id,
      userId: keys.userId,
      key: keys.key,
      name: keys.name,
      isEnabled: keys.isEnabled,
      expiresAt: keys.expiresAt,
      createdAt: keys.createdAt,
      updatedAt: keys.updatedAt,
      deletedAt: keys.deletedAt,
    })
    .from(keys)
    .where(and(eq(keys.userId, userId), isNull(keys.deletedAt)))
    .orderBy(keys.createdAt);

  return result.map(toKey);
}

export async function createKey(keyData: CreateKeyData): Promise<Key> {
  const dbData = {
    userId: keyData.user_id,
    key: keyData.key,
    name: keyData.name,
    isEnabled: keyData.is_enabled,
    expiresAt: keyData.expires_at,
  };

  const [key] = await db.insert(keys).values(dbData).returning({
    id: keys.id,
    userId: keys.userId,
    key: keys.key,
    name: keys.name,
    isEnabled: keys.isEnabled,
    expiresAt: keys.expiresAt,
    createdAt: keys.createdAt,
    updatedAt: keys.updatedAt,
    deletedAt: keys.deletedAt,
  });

  return toKey(key);
}

export async function updateKey(
  id: number,
  keyData: UpdateKeyData,
): Promise<Key | null> {
  if (Object.keys(keyData).length === 0) {
    return findKeyById(id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbData: any = {
    updatedAt: new Date(),
  };
  if (keyData.name !== undefined) dbData.name = keyData.name;
  if (keyData.is_enabled !== undefined) dbData.isEnabled = keyData.is_enabled;
  if (keyData.expires_at !== undefined) dbData.expiresAt = keyData.expires_at;

  const [key] = await db
    .update(keys)
    .set(dbData)
    .where(and(eq(keys.id, id), isNull(keys.deletedAt)))
    .returning({
      id: keys.id,
      userId: keys.userId,
      key: keys.key,
      name: keys.name,
      isEnabled: keys.isEnabled,
      expiresAt: keys.expiresAt,
      createdAt: keys.createdAt,
      updatedAt: keys.updatedAt,
      deletedAt: keys.deletedAt,
    });

  if (!key) return null;
  return toKey(key);
}

export async function findActiveKeyByUserIdAndName(
  userId: number,
  name: string,
): Promise<Key | null> {
  const [key] = await db
    .select({
      id: keys.id,
      userId: keys.userId,
      key: keys.key,
      name: keys.name,
      isEnabled: keys.isEnabled,
      expiresAt: keys.expiresAt,
      createdAt: keys.createdAt,
      updatedAt: keys.updatedAt,
      deletedAt: keys.deletedAt,
    })
    .from(keys)
    .where(and(
      eq(keys.userId, userId),
      eq(keys.name, name),
      isNull(keys.deletedAt),
      eq(keys.isEnabled, true),
      or(isNull(keys.expiresAt), gt(keys.expiresAt, new Date()))
    ));

  if (!key) return null;
  return toKey(key);
}

export async function findKeyUsageToday(userId: number): Promise<Array<{ keyId: number; totalCost: number }>> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const rows = await db
    .select({
      keyId: keys.id,
      totalCost: sum(messageRequest.costUsd),
    })
    .from(keys)
    .leftJoin(messageRequest, and(
      eq(messageRequest.key, keys.key),
      isNull(messageRequest.deletedAt),
      gte(messageRequest.createdAt, today),
      lt(messageRequest.createdAt, tomorrow)
    ))
    .where(and(
      eq(keys.userId, userId),
      isNull(keys.deletedAt)
    ))
    .groupBy(keys.id);

  return rows.map((row) => ({
    keyId: row.keyId,
    totalCost: (() => {
      const rawCost = row.totalCost;
      if (rawCost === null || rawCost === undefined) {
        return 0;
      }
      const costNumber = typeof rawCost === "number" ? rawCost : Number(rawCost);
      return Number.isFinite(costNumber) ? costNumber : 0;
    })()
  }));
}

export async function countActiveKeysByUser(userId: number): Promise<number> {
  const [row] = await db
    .select({ count: count() })
    .from(keys)
    .where(and(
      eq(keys.userId, userId),
      isNull(keys.deletedAt)
    ));

  return Number(row?.count || 0);
}

export async function deleteKey(id: number): Promise<boolean> {
  const result = await db
    .update(keys)
    .set({ deletedAt: new Date() })
    .where(and(eq(keys.id, id), isNull(keys.deletedAt)))
    .returning({ id: keys.id });

  return result.length > 0;
}

export async function findActiveKeyByKeyString(
  keyString: string,
): Promise<Key | null> {
  const [key] = await db
    .select({
      id: keys.id,
      userId: keys.userId,
      key: keys.key,
      name: keys.name,
      isEnabled: keys.isEnabled,
      expiresAt: keys.expiresAt,
      createdAt: keys.createdAt,
      updatedAt: keys.updatedAt,
      deletedAt: keys.deletedAt,
    })
    .from(keys)
    .where(and(
      eq(keys.key, keyString),
      isNull(keys.deletedAt),
      eq(keys.isEnabled, true),
      or(isNull(keys.expiresAt), gt(keys.expiresAt, new Date()))
    ));

  if (!key) return null;
  return toKey(key);
}

// 验证 API Key 并返回用户信息
export async function validateApiKeyAndGetUser(
  keyString: string,
): Promise<{ user: User; key: Key } | null> {
  const result = await db
    .select({
      // Key fields
      keyId: keys.id,
      keyUserId: keys.userId,
      keyString: keys.key,
      keyName: keys.name,
      keyIsEnabled: keys.isEnabled,
      keyExpiresAt: keys.expiresAt,
      keyCreatedAt: keys.createdAt,
      keyUpdatedAt: keys.updatedAt,
      keyDeletedAt: keys.deletedAt,
      // User fields
      userId: users.id,
      userName: users.name,
      userDescription: users.description,
      userRole: users.role,
      userRpm: users.rpmLimit,
      userDailyQuota: users.dailyLimitUsd,
      userCreatedAt: users.createdAt,
      userUpdatedAt: users.updatedAt,
      userDeletedAt: users.deletedAt,
    })
    .from(keys)
    .innerJoin(users, eq(keys.userId, users.id))
    .where(and(
      eq(keys.key, keyString),
      isNull(keys.deletedAt),
      eq(keys.isEnabled, true),
      or(isNull(keys.expiresAt), gt(keys.expiresAt, new Date())),
      isNull(users.deletedAt)
    ));

  if (result.length === 0) {
    return null;
  }

  const row = result[0];

  const user: User = toUser({
    id: row.userId,
    name: row.userName,
    description: row.userDescription,
    role: row.userRole,
    rpm: row.userRpm,
    dailyQuota: row.userDailyQuota,
    createdAt: row.userCreatedAt,
    updatedAt: row.userUpdatedAt,
    deletedAt: row.userDeletedAt,
  });

  const key: Key = toKey({
    id: row.keyId,
    userId: row.keyUserId,
    key: row.keyString,
    name: row.keyName,
    isEnabled: row.keyIsEnabled,
    expiresAt: row.keyExpiresAt,
    createdAt: row.keyCreatedAt,
    updatedAt: row.keyUpdatedAt,
    deletedAt: row.keyDeletedAt,
  });

  return { user, key };
}
