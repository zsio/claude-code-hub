"use server";

import { db } from "@/drizzle/db";
import { modelPrices } from "@/drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";
import type { ModelPrice, ModelPriceData } from "@/types/model-price";
import { toModelPrice } from "./_shared/transformers";

/**
 * 获取指定模型的最新价格
 */
export async function findLatestPriceByModel(modelName: string): Promise<ModelPrice | null> {
  const [price] = await db
    .select({
      id: modelPrices.id,
      modelName: modelPrices.modelName,
      priceData: modelPrices.priceData,
      createdAt: modelPrices.createdAt,
      updatedAt: modelPrices.updatedAt,
    })
    .from(modelPrices)
    .where(eq(modelPrices.modelName, modelName))
    .orderBy(desc(modelPrices.createdAt))
    .limit(1);

  if (!price) return null;
  return toModelPrice(price);
}

/**
 * 获取所有模型的最新价格
 * 注意：使用原生SQL，因为涉及到ROW_NUMBER()窗口函数
 */
export async function findAllLatestPrices(): Promise<ModelPrice[]> {
  const query = sql`
    WITH latest_prices AS (
      SELECT
        model_name,
        MAX(created_at) as max_created_at
      FROM model_prices
      WHERE model_name ILIKE 'claude-%'
      GROUP BY model_name
    ),
    latest_records AS (
      SELECT
        mp.id,
        mp.model_name,
        mp.price_data,
        mp.created_at,
        mp.updated_at,
        ROW_NUMBER() OVER (PARTITION BY mp.model_name ORDER BY mp.id DESC) as rn
      FROM model_prices mp
      INNER JOIN latest_prices lp
        ON mp.model_name = lp.model_name
        AND mp.created_at = lp.max_created_at
    )
    SELECT
      id,
      model_name as "modelName",
      price_data as "priceData",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM latest_records
    WHERE rn = 1
    ORDER BY model_name
  `;

  const result = await db.execute(query);
  return Array.from(result).map(toModelPrice);
}

/**
 * 创建新的价格记录
 */
export async function createModelPrice(
  modelName: string,
  priceData: ModelPriceData
): Promise<ModelPrice> {
  const [price] = await db
    .insert(modelPrices)
    .values({
      modelName: modelName,
      priceData: priceData,
    })
    .returning({
      id: modelPrices.id,
      modelName: modelPrices.modelName,
      priceData: modelPrices.priceData,
      createdAt: modelPrices.createdAt,
      updatedAt: modelPrices.updatedAt,
    });

  return toModelPrice(price);
}

/**
 * 批量创建价格记录
 */
