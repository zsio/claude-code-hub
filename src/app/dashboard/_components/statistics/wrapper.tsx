"use client";

import * as React from "react";
import { UserStatisticsChart } from "./chart";
import { getUserStatistics } from "@/actions/statistics";
import type { TimeRange, UserStatisticsData } from "@/types/statistics";
import { DEFAULT_TIME_RANGE } from "@/types/statistics";
import { toast } from "sonner";

interface StatisticsWrapperProps {
  initialData?: UserStatisticsData;
}

/**
 * 统计组件包装器
 * 处理时间范围状态管理和数据获取
 */
export function StatisticsWrapper({ initialData }: StatisticsWrapperProps) {
  const [timeRange, setTimeRange] = React.useState<TimeRange>(
    initialData?.timeRange ?? DEFAULT_TIME_RANGE
  );
  const [data, setData] = React.useState<UserStatisticsData | null>(initialData ?? null);
  const [loading, setLoading] = React.useState(false);

  // 防抖获取统计数据
  const fetchStatistics = React.useCallback(async (newTimeRange: TimeRange) => {
    if (loading) return; // 防止重复请求

    setLoading(true);
    try {
      const result = await getUserStatistics(newTimeRange);
      if (!result.ok) {
        toast.error(result.error || '获取统计数据失败');
        return;
      }

      if (!result.data) {
        toast.error('统计数据为空');
        return;
      }

      setData(result.data);
      setTimeRange(newTimeRange);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      toast.error('获取统计数据失败');
    } finally {
      // 添加一个小延迟让用户看到加载状态，避免闪烁
      setTimeout(() => setLoading(false), 150);
    }
  }, [loading]);

  // 处理时间范围变化
  const handleTimeRangeChange = React.useCallback((newTimeRange: TimeRange) => {
    if (newTimeRange !== timeRange && !loading) {
      fetchStatistics(newTimeRange);
    }
  }, [timeRange, loading, fetchStatistics]);

  // 如果没有数据且不在加载中，显示空状态
  if (!data && !loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        暂无统计数据
      </div>
    );
  }

  // 如果有数据，显示图表
  if (data) {
    return (
      <UserStatisticsChart
        data={data}
        onTimeRangeChange={handleTimeRangeChange}
        loading={loading}
      />
    );
  }

  // 纯加载状态
  return (
    <div className="text-center py-8">
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
        加载统计数据...
      </div>
    </div>
  );
}
