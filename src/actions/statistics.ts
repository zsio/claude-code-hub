"use server";

import { getSession } from "@/lib/auth";
import { getUserStatisticsFromDB, getActiveUsersFromDB } from "@/repository/statistics";
import type {
  TimeRange,
  UserStatisticsData,
  DatabaseStatRow,
  DatabaseUser,
  ChartDataItem,
  StatisticsUser,
} from "@/types/statistics";
import { TIME_RANGE_OPTIONS, DEFAULT_TIME_RANGE } from "@/types/statistics";
import type { ActionResult } from "./types";

/**
 * 生成图表数据使用的用户键，避免名称碰撞
 */
const createUserDataKey = (userId: number): string => `user-${userId}`;

/**
 * 获取用户统计数据，用于图表展示
 */
export async function getUserStatistics(
  timeRange: TimeRange = DEFAULT_TIME_RANGE
): Promise<ActionResult<UserStatisticsData>> {
  try {
    const session = await getSession();
    if (!session) {
      return {
        ok: false,
        error: "未登录",
      };
    }

    // 获取时间范围配置
    const rangeConfig = TIME_RANGE_OPTIONS.find(option => option.key === timeRange);
    if (!rangeConfig) {
      throw new Error(`Invalid time range: ${timeRange}`);
    }

    const [statsData, users] = await Promise.all([
      getUserStatisticsFromDB(timeRange),
      getActiveUsersFromDB()
    ]);

    // 将数据转换为适合图表的格式
    const dataByDate = new Map<string, ChartDataItem>();

    statsData.forEach((row: DatabaseStatRow) => {
      // 根据分辨率格式化日期
      let dateStr: string;
      if (rangeConfig.resolution === 'hour') {
        // 小时分辨率：显示为 "HH:mm" 格式
        const hour = new Date(row.date);
        dateStr = hour.toISOString();
      } else {
        // 天分辨率：显示为 "YYYY-MM-DD" 格式
        dateStr = new Date(row.date).toISOString().split('T')[0];
      }

      if (!dataByDate.has(dateStr)) {
        dataByDate.set(dateStr, {
          date: dateStr,
        });
      }

      const dateData = dataByDate.get(dateStr)!;
      const userKey = createUserDataKey(row.user_id);

      // 安全地处理大数值，防止精度问题
      const cost = row.total_cost ? parseFloat(row.total_cost.toString()) : 0;
      const calls = row.api_calls || 0;

      // 为每个用户创建消费和调用次数的键
      dateData[`${userKey}_cost`] = cost;
      dateData[`${userKey}_calls`] = calls;
    });

    const result: UserStatisticsData = {
      chartData: Array.from(dataByDate.values()),
      users: users.map((u: DatabaseUser): StatisticsUser => ({
        id: u.id,
        name: u.name || `User${u.id}`,
        dataKey: createUserDataKey(u.id),
      })),
      timeRange,
      resolution: rangeConfig.resolution
    };

    return {
      ok: true,
      data: result
    };
  } catch (error) {
    console.error('Failed to get user statistics:', error);

    // 提供更具体的错误信息
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    if (errorMessage.includes('numeric field overflow')) {
      return {
        ok: false,
        error: '数据金额过大，请检查数据库中的费用记录'
      };
    }

    return {
      ok: false,
      error: '获取统计数据失败：' + errorMessage
    };
  }
}
