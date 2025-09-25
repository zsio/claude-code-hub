export type TimeRange = 'today' | '7days' | '30days';

export interface TimeRangeConfig {
  label: string;
  key: TimeRange;
  resolution: 'hour' | 'day';
  description?: string;
}

export const TIME_RANGE_OPTIONS: TimeRangeConfig[] = [
  {
    label: '今天',
    key: 'today',
    resolution: 'hour',
    description: '今日用量'
  },
  {
    label: '7天',
    key: '7days',
    resolution: 'day',
    description: '近七天'
  },
  {
    label: '30天',
    key: '30days',
    resolution: 'day',
    description: '近三十天'
  }
];

export const DEFAULT_TIME_RANGE: TimeRange = 'today';

export interface ChartDataItem {
  date: string;
  [key: string]: string | number;
}

export interface DatabaseStatRow {
  user_id: number;
  user_name: string;
  date: string;
  api_calls: number;
  total_cost: number;
}

export interface DatabaseUser {
  id: number;
  name: string;
}

export interface StatisticsUser {
  id: number;
  name: string;
  dataKey: string;
}

export interface UserStatisticsData {
  chartData: ChartDataItem[];
  users: StatisticsUser[];
  timeRange: TimeRange;
  resolution: 'hour' | 'day';
}
