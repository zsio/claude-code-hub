"use client"

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
} from "@/components/ui/chart";

import type { UserStatisticsData, TimeRange } from "@/types/statistics";
import { TimeRangeSelector } from "./time-range-selector";

// 固定的调色盘，确保新增用户也能获得可辨识的颜色
const USER_COLOR_PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "hsl(15, 85%, 60%)",
  "hsl(195, 85%, 60%)",
  "hsl(285, 85%, 60%)",
  "hsl(135, 85%, 50%)",
  "hsl(45, 85%, 55%)",
  "hsl(315, 85%, 65%)",
  "hsl(165, 85%, 55%)",
  "hsl(35, 85%, 65%)",
  "hsl(255, 85%, 65%)",
  "hsl(75, 85%, 50%)",
  "hsl(345, 85%, 65%)",
  "hsl(105, 85%, 55%)",
  "hsl(225, 85%, 65%)",
  "hsl(55, 85%, 60%)",
  "hsl(275, 85%, 60%)",
  "hsl(25, 85%, 65%)",
  "hsl(185, 85%, 60%)",
  "hsl(125, 85%, 55%)",
  "hsl(295, 85%, 70%)",
] as const;

// 根据索引循环分配颜色，避免重复定义数组
const getUserColor = (index: number) =>
  USER_COLOR_PALETTE[index % USER_COLOR_PALETTE.length];

export interface UserStatisticsChartProps {
  data: UserStatisticsData;
  onTimeRangeChange?: (timeRange: TimeRange) => void;
  loading?: boolean;
}

/**
 * 用户统计图表组件
 * 展示用户的消费金额和API调用次数
 */
export function UserStatisticsChart({ data, onTimeRangeChange, loading = false }: UserStatisticsChartProps) {
  const [activeChart, setActiveChart] = React.useState<"cost" | "calls">("cost")

  // 动态生成图表配置
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      cost: {
        label: "消费金额",
      },
      calls: {
        label: "API调用次数",
      },
    }

    data.users.forEach((user, index) => {
      config[user.dataKey] = {
        label: user.name,
        color: getUserColor(index),
      }
    })

    return config
  }, [data.users])

  const userMap = React.useMemo(() => {
    return new Map(data.users.map((user) => [user.dataKey, user]))
  }, [data.users])

  // 计算每个用户的总数据
  const userTotals = React.useMemo(() => {
    const totals: Record<string, { cost: number; calls: number }> = {}

    data.users.forEach(user => {
      totals[user.dataKey] = { cost: 0, calls: 0 }
    })

    data.chartData.forEach(day => {
      data.users.forEach(user => {
        const costValue = day[`${user.dataKey}_cost`]
        const callsValue = day[`${user.dataKey}_calls`]

        totals[user.dataKey].cost += typeof costValue === 'number' ? costValue : 0
        totals[user.dataKey].calls += typeof callsValue === 'number' ? callsValue : 0
      })
    })

    return totals
  }, [data.chartData, data.users])

  const sortedLegendUsers = React.useMemo(() => {
    return data.users
      .map((user, index) => ({ user, index }))
      .sort((a, b) => {
        const totalsA = userTotals[a.user.dataKey]
        const totalsB = userTotals[b.user.dataKey]
        const valueA = totalsA ? totalsA[activeChart] : 0
        const valueB = totalsB ? totalsB[activeChart] : 0

        if (valueA === valueB) {
          return a.index - b.index
        }

        return valueB - valueA
      })
  }, [data.users, userTotals, activeChart])

  // 计算总计
  const totals = React.useMemo(() => {
    const costTotal = data.chartData.reduce((sum, day) => {
      const dayTotal = data.users.reduce((daySum, user) => {
        const costValue = day[`${user.dataKey}_cost`]
        return daySum + (typeof costValue === 'number' ? costValue : 0);
      }, 0)
      return sum + dayTotal
    }, 0)

    const callsTotal = data.chartData.reduce((sum, day) => {
      const dayTotal = data.users.reduce((daySum, user) => {
        const callsValue = day[`${user.dataKey}_calls`]
        return daySum + (typeof callsValue === 'number' ? callsValue : 0);
      }, 0)
      return sum + dayTotal
    }, 0)

    return { cost: costTotal, calls: callsTotal }
  }, [data.chartData, data.users])

  // 格式化日期显示（根据分辨率）
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (data.resolution === 'hour') {
      return date.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } else {
      return date.toLocaleDateString("zh-CN", {
        month: "numeric",
        day: "numeric",
      })
    }
  }

  // 格式化tooltip日期
  const formatTooltipDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (data.resolution === 'hour') {
      return date.toLocaleString("zh-CN", {
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } else {
      return date.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }
  }

  // 获取时间范围的描述文本
  const getTimeRangeDescription = () => {
    switch (data.timeRange) {
      case 'today':
        return '今天的使用情况'
      case '7days':
        return '过去 7 天的使用情况'
      case '30days':
        return '过去 30 天的使用情况'
      default:
        return '使用情况'
    }
  }

  return (
    <Card className="gap-0 py-0">
      <CardHeader
        className={cn(
          "flex flex-col items-stretch lg:flex-row",
          onTimeRangeChange && "border-b !pb-0 !px-0"
        )}
      >
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 lg:!py-0">
          <div className="flex items-center gap-2">
            <CardTitle>使用统计</CardTitle>
            {loading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
            )}
          </div>
          <CardDescription>
            {getTimeRangeDescription()}
          </CardDescription>
        </div>
        {/* 时间范围选择器 */}
        {onTimeRangeChange && (
          <TimeRangeSelector
            value={data.timeRange}
            onChange={onTimeRangeChange}
            disabled={loading}
            className="border-t lg:border-t-0"
          />
        )}
        {/* 如果没有时间范围选择回调，显示原有的指标切换按钮 */}
        {!onTimeRangeChange && (
          <div className="flex">
            <button
              data-active={activeChart === "cost"}
              className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l lg:border-t-0 lg:border-l lg:px-8 lg:py-6"
              onClick={() => setActiveChart("cost")}
            >
              <span className="text-muted-foreground text-xs">
                总消费金额
              </span>
              <span className="text-lg leading-none font-bold sm:text-3xl">
                ${totals.cost.toFixed(2)}
              </span>
            </button>
            <button
              data-active={activeChart === "calls"}
              className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l lg:border-t-0 lg:border-l lg:px-8 lg:py-6"
              onClick={() => setActiveChart("calls")}
            >
              <span className="text-muted-foreground text-xs">
                总API调用次数
              </span>
              <span className="text-lg leading-none font-bold sm:text-3xl">
                {totals.calls.toLocaleString()}
              </span>
            </button>
          </div>
        )}
      </CardHeader>

      {onTimeRangeChange && (
        <div className="flex border-b">
          <button
            data-active={activeChart === "cost"}
            className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 px-6 py-3 text-left even:border-l transition-colors hover:bg-muted/30"
            onClick={() => setActiveChart("cost")}
          >
            <span className="text-muted-foreground text-xs">
              总消费金额
            </span>
            <span className="text-lg leading-none font-bold sm:text-xl">
              ${totals.cost.toFixed(2)}
            </span>
          </button>
          <button
            data-active={activeChart === "calls"}
            className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 px-6 py-3 text-left even:border-l transition-colors hover:bg-muted/30"
            onClick={() => setActiveChart("calls")}
          >
            <span className="text-muted-foreground text-xs">
              总API调用次数
            </span>
            <span className="text-lg leading-none font-bold sm:text-xl">
              {totals.calls.toLocaleString()}
            </span>
          </button>
        </div>
      )}
      <CardContent className="px-1 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[280px] w-full"
        >
          <AreaChart
            data={data.chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <defs>
              {data.users.map((user, index) => {
                const color = getUserColor(index)
                return (
                  <linearGradient
                    key={user.dataKey}
                    id={`fill-${user.dataKey}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={color}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={color}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                )
              })}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={2}
              tickFormatter={formatDate}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                if (activeChart === "cost") {
                  return `$${value}`
                }
                return value.toString()
              }}
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null

                return (
                  <div className="rounded-lg border bg-background p-3 shadow-sm min-w-[200px]">
                    <div className="grid gap-2">
                      <div className="font-medium text-center">
                        {formatTooltipDate(label)}
                      </div>
                      <div className="grid gap-1.5">
                        {payload
                          .sort((a, b) => (b.value as number) - (a.value as number))
                          .map((entry, index) => {
                          const baseKey = entry.dataKey?.toString().replace(`_${activeChart}`, '') || ''
                          const displayUser = userMap.get(baseKey)
                          const value = entry.value as number
                          const color = entry.color

                          return (
                            <div key={index} className="flex items-center justify-between gap-3 text-sm">
                              <div className="flex items-center gap-2 min-w-0">
                                <div
                                  className="h-2 w-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: color }}
                                />
                                <span className="font-medium truncate">{displayUser?.name || baseKey}:</span>
                              </div>
                              <span className="ml-auto font-mono flex-shrink-0">
                                {activeChart === "cost"
                                  ? `$${value.toFixed(2)}`
                                  : value.toLocaleString()
                                }
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              }}
            />
            {data.users.map((user, index) => {
              const color = getUserColor(index)
              return (
                <Area
                  key={user.dataKey}
                  dataKey={`${user.dataKey}_${activeChart}`}
                  name={user.name}
                  type="monotone"
                  fill={`url(#fill-${user.dataKey})`}
                  stroke={color}
                  stackId="a"
                />
              )
            })}
            <ChartLegend
              content={() => (
                <div className="px-1">
                  <div className="flex flex-wrap justify-center gap-1">
                    {sortedLegendUsers.map(({ user, index }) => {
                      const color = getUserColor(index)
                      const userTotal = userTotals[user.dataKey] ?? { cost: 0, calls: 0 }

                      return (
                        <div
                          key={user.dataKey}
                          className="bg-muted/30 rounded-md px-3 py-2 text-center transition-all hover:bg-muted/50 min-w-16"
                        >
                          {/* 上方：颜色点 + 用户名 */}
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <div
                              className="h-2 w-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-xs font-medium text-foreground truncate max-w-12">
                              {user.name}
                            </span>
                          </div>

                          {/* 下方：数据值 */}
                          <div className="text-xs font-bold text-foreground">
                            {activeChart === "cost"
                              ? `$${userTotal.cost.toFixed(2)}`
                              : userTotal.calls.toLocaleString()
                            }
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
