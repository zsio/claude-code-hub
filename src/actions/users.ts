"use server";

import {
  findUserList,
  createUser,
  updateUser,
  deleteUser,
} from "@/repository/user";
import { findKeyList, findKeyUsageToday } from "@/repository/key";
import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { type UserDisplay } from "@/types/user";
import { maskKey } from "@/lib/utils/validation";
import { CreateUserSchema, UpdateUserSchema } from "@/lib/validation/schemas";
import { USER_DEFAULTS } from "@/lib/constants/user.constants";
import { createKey } from "@/repository/key";
import { getSession } from "@/lib/auth";
import type { ActionResult } from "./types";

// 获取用户数据
export async function getUsers(): Promise<UserDisplay[]> {
  try {
    const session = await getSession();
    if (!session) {
      return [];
    }

    // 普通用户只能看到自己的数据
    let users;
    if (session.user.role === "user") {
      users = [session.user]; // 只返回当前用户
    } else {
      users = await findUserList(); // 管理员可以看到所有用户
    }

    if (users.length === 0) {
      return [];
    }

    // 管理员可以看到完整Key，普通用户只能看到掩码
    const isAdmin = session.user.role === "admin";

    const userDisplays: UserDisplay[] = await Promise.all(
      users.map(async (user) => {
        try {
          const [keys, usageRecords] = await Promise.all([
            findKeyList(user.id),
            findKeyUsageToday(user.id)
          ]);

          const usageMap = new Map(
            usageRecords.map((item) => [item.keyId, item.totalCost ?? 0])
          );

          return {
            id: user.id,
            name: user.name,
            note: user.description || undefined,
            role: user.role,
            rpm: user.rpm,
            dailyQuota: user.dailyQuota,
            keys: keys.map((key) => ({
              id: key.id,
              name: key.name,
              maskedKey: maskKey(key.key),
              fullKey: isAdmin ? key.key : undefined, // 仅管理员可见
              canCopy: isAdmin, // 仅管理员可复制
              expiresAt: key.expiresAt
                ? key.expiresAt.toISOString().split("T")[0]
                : "永不过期",
              status: key.isEnabled ? "enabled" : ("disabled" as const),
              createdAt: key.createdAt,
              createdAtFormatted: key.createdAt.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              }),
              todayUsage: usageMap.get(key.id) ?? 0
            })),
          };
        } catch (error) {
          console.error(`获取用户 ${user.id} 的密钥失败:`, error);
          return {
            id: user.id,
            name: user.name,
            note: user.description || undefined,
            role: user.role,
            rpm: user.rpm,
            dailyQuota: user.dailyQuota,
            keys: [],
          };
        }
      }),
    );

    return userDisplays;
  } catch (error) {
    console.error("获取用户数据失败:", error);
    return [];
  }
}

// 添加用户
export async function addUser(data: {
  name: string;
  note?: string;
  rpm?: number;
  dailyQuota?: number;
}): Promise<ActionResult> {
  try {
    // 权限检查：只有管理员可以添加用户
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return { ok: false, error: "无权限执行此操作" } as const;
    }

    const validatedData = CreateUserSchema.parse({
      name: data.name,
      note: data.note || "",
      rpm: data.rpm || USER_DEFAULTS.RPM,
      dailyQuota: data.dailyQuota || USER_DEFAULTS.DAILY_QUOTA,
    });

    const newUser = await createUser({
      name: validatedData.name,
      description: validatedData.note || "",
      rpm: validatedData.rpm,
      dailyQuota: validatedData.dailyQuota,
    });

    // 为新用户创建默认密钥
    const generatedKey = "sk-" + randomBytes(16).toString("hex");
    await createKey({
      user_id: newUser.id,
      name: "default",
      key: generatedKey,
      is_enabled: true,
      expires_at: undefined,
    });

    revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) {
    console.error("添加用户失败:", error);
    const message =
      error instanceof Error ? error.message : "添加用户失败，请稍后重试";
    return { ok: false, error: message };
  }
}

// 更新用户
export async function editUser(
  userId: number,
  data: { name?: string; note?: string; rpm?: number; dailyQuota?: number },
): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return { ok: false, error: "无权限执行此操作" };
    }

    const validatedData = UpdateUserSchema.parse(data);

    await updateUser(userId, {
      name: validatedData.name,
      description: validatedData.note,
      rpm: validatedData.rpm,
      dailyQuota: validatedData.dailyQuota,
    });

    revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) {
    console.error("更新用户失败:", error);
    const message =
      error instanceof Error ? error.message : "更新用户失败，请稍后重试";
    return { ok: false, error: message };
  }
}

// 删除用户
export async function removeUser(
  userId: number,
): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return { ok: false, error: "无权限执行此操作" };
    }

    await deleteUser(userId);
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) {
    console.error("删除用户失败:", error);
    const message =
      error instanceof Error ? error.message : "删除用户失败，请稍后重试";
    return { ok: false, error: message };
  }
}
