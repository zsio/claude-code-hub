'use server';

import { findProviderList, createProvider, updateProvider, deleteProvider } from "@/repository/provider";
import { revalidatePath } from "next/cache";
import { type ProviderDisplay } from "@/types/provider";
import { maskKey } from "@/lib/utils/validation";
import { getSession } from "@/lib/auth";
import { CreateProviderSchema, UpdateProviderSchema } from "@/lib/validation/schemas";
import type { ActionResult } from "./types";

// 获取服务商数据
export async function getProviders(): Promise<ProviderDisplay[]> {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'admin') {
      return [];
    }

    const providers = await findProviderList();
    
    return providers.map(provider => ({
      id: provider.id,
      name: provider.name,
      url: provider.url,
      maskedKey: maskKey(provider.key),
      isEnabled: provider.isEnabled,
      weight: provider.weight,
      tpm: provider.tpm,
      rpm: provider.rpm,
      rpd: provider.rpd,
      cc: provider.cc,
      createdAt: provider.createdAt.toISOString().split('T')[0],
      updatedAt: provider.updatedAt.toISOString().split('T')[0],
    }));
  } catch (error) {
    console.error("获取服务商数据失败:", error);
    return [];
  }
}

// 添加服务商
export async function addProvider(data: {
  name: string;
  url: string;
  key: string;
  is_enabled?: boolean;
  weight?: number;
  tpm: number | null;
  rpm: number | null;
  rpd: number | null;
  cc: number | null;
}): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'admin') {
      return { ok: false, error: '无权限执行此操作' };
    }

    const validated = CreateProviderSchema.parse(data);
    const payload = {
      ...validated,
      tpm: validated.tpm ?? null,
      rpm: validated.rpm ?? null,
      rpd: validated.rpd ?? null,
      cc: validated.cc ?? null,
    };
    await createProvider(payload);
    revalidatePath('/settings/providers');
    return { ok: true };
  } catch (error) {
    console.error('创建服务商失败:', error);
    const message = error instanceof Error ? error.message : '创建服务商失败';
    return { ok: false, error: message };
  }
}

// 更新服务商
export async function editProvider(
  providerId: number,
  data: {
    name?: string;
    url?: string;
    key?: string;
    is_enabled?: boolean;
    weight?: number;
    tpm?: number | null;
    rpm?: number | null;
    rpd?: number | null;
    cc?: number | null;
  }
): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'admin') {
      return { ok: false, error: '无权限执行此操作' };
    }

    const validated = UpdateProviderSchema.parse(data);
    await updateProvider(providerId, validated);
    revalidatePath('/settings/providers');
    return { ok: true };
  } catch (error) {
    console.error('更新服务商失败:', error);
    const message = error instanceof Error ? error.message : '更新服务商失败';
    return { ok: false, error: message };
  }
}

// 删除服务商
export async function removeProvider(providerId: number): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'admin') {
      return { ok: false, error: '无权限执行此操作' };
    }

    await deleteProvider(providerId);
    revalidatePath('/settings/providers');
    return { ok: true };
  } catch (error) {
    console.error('删除服务商失败:', error);
    const message = error instanceof Error ? error.message : '删除服务商失败';
    return { ok: false, error: message };
  }
}
