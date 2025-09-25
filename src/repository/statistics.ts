"use server";

import { db } from "@/drizzle/db";
import { sql } from "drizzle-orm";
import type { TimeRange } from "@/types/statistics";

// 为了类型安全，定义返回类型
interface StatRowResult {
  user_id: number;
  user_name: string;
  date: string;
  api_calls: number;
  total_cost: number;
}

interface UserResult {
  id: number;
  name: string;
}

/**
 * 根据时间范围获取用户消费和API调用统计
 * 注意：这个函数使用原生SQL，因为涉及到PostgreSQL特定的generate_series函数
 */
export async function getUserStatisticsFromDB(timeRange: TimeRange): Promise<StatRowResult[]> {
  let query;

  switch (timeRange) {
    case 'today':
      // 今天（小时分辨率）
      query = sql`
        WITH hour_range AS (
          SELECT generate_series(
            DATE_TRUNC('day', NOW()),
            DATE_TRUNC('day', NOW()) + INTERVAL '23 hours',
            '1 hour'::interval
          ) AS hour
        ),
        hourly_stats AS (
          SELECT
            u.id AS user_id,
            u.name AS user_name,
            hr.hour,
            COUNT(mr.id) AS api_calls,
            COALESCE(SUM(mr.cost_usd), 0) AS total_cost
          FROM users u
          CROSS JOIN hour_range hr
          LEFT JOIN message_request mr ON u.id = mr.user_id
            AND DATE_TRUNC('hour', mr.created_at) = hr.hour
            AND mr.deleted_at IS NULL
          WHERE u.deleted_at IS NULL
          GROUP BY u.id, u.name, hr.hour
        )
        SELECT
          user_id,
          user_name,
          hour AS date,
          api_calls::integer,
          total_cost::numeric
        FROM hourly_stats
        ORDER BY hour ASC, user_name ASC
      `;
      break;

    case '7days':
      // 过去7天（天分辨率）
      query = sql`
        WITH date_range AS (
          SELECT generate_series(
            CURRENT_DATE - INTERVAL '6 days',
            CURRENT_DATE,
            '1 day'::interval
          )::date AS date
        ),
        daily_stats AS (
          SELECT
            u.id AS user_id,
            u.name AS user_name,
            dr.date,
            COUNT(mr.id) AS api_calls,
            COALESCE(SUM(mr.cost_usd), 0) AS total_cost
          FROM users u
          CROSS JOIN date_range dr
          LEFT JOIN message_request mr ON u.id = mr.user_id
            AND DATE(mr.created_at) = dr.date
            AND mr.deleted_at IS NULL
          WHERE u.deleted_at IS NULL
          GROUP BY u.id, u.name, dr.date
        )
        SELECT
          user_id,
          user_name,
          date,
          api_calls::integer,
          total_cost::numeric
        FROM daily_stats
        ORDER BY date ASC, user_name ASC
      `;
      break;

    case '30days':
      // 过去 30 天（天分辨率）
      query = sql`
        WITH date_range AS (
          SELECT generate_series(
            CURRENT_DATE - INTERVAL '29 days',
            CURRENT_DATE,
            '1 day'::interval
          )::date AS date
        ),
        daily_stats AS (
          SELECT
            u.id AS user_id,
            u.name AS user_name,
            dr.date,
            COUNT(mr.id) AS api_calls,
            COALESCE(SUM(mr.cost_usd), 0) AS total_cost
          FROM users u
          CROSS JOIN date_range dr
          LEFT JOIN message_request mr ON u.id = mr.user_id
            AND DATE(mr.created_at) = dr.date
            AND mr.deleted_at IS NULL
          WHERE u.deleted_at IS NULL
          GROUP BY u.id, u.name, dr.date
        )
        SELECT
          user_id,
          user_name,
          date,
          api_calls::integer,
          total_cost::numeric
        FROM daily_stats
        ORDER BY date ASC, user_name ASC
      `;
      break;

    default:
      throw new Error(`Unsupported time range: ${timeRange}`);
  }

  const result = await db.execute(query);
  return Array.from(result) as unknown as StatRowResult[];
}

/**
 * 获取所有活跃用户列表
 */
export async function getActiveUsersFromDB(): Promise<UserResult[]> {
  const query = sql`
    SELECT id, name
    FROM users
    WHERE deleted_at IS NULL
    ORDER BY name ASC
  `;

  const result = await db.execute(query);
  return Array.from(result) as unknown as UserResult[];
}
