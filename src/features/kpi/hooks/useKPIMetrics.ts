/**
 * KPI Metrics Hook
 *
 * - 30 秒 Polling 即時更新
 * - API → UI 資料轉換 + 效能監控
 * - 負面指標顏色反轉邏輯
 */

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  Factory,
  AlertTriangle,
  TrendingUp,
  Clock,
  Gauge,
  type LucideIcon,
} from "lucide-react";
import { fetchKPI, type KPIData, type KPIItem } from "@/services/endpoints/kpi";
import { usePerformanceStore } from "@/stores/usePerformanceStore";

//! =============== 型別定義 ===============

export type TrendDirection = "up" | "down" | "stable";
export type TrendColor = "green" | "red" | "yellow" | "blue" | "gray";

export interface StatCardData {
  key: string;
  value: string;
  unit: string;
  change: string;
  trend: TrendDirection;
  color: TrendColor;
  icon: LucideIcon;
}

interface MetricConfig {
  icon: LucideIcon;
  isNegative: boolean;
}

//! =============== 常量配置 ===============

const POLLING_INTERVAL = 30_000; // 30 秒

//* 指標配置：icon, isNegative (決定顏色邏輯)
const METRIC_CONFIG: Record<keyof KPIData, MetricConfig> = {
  productionOutput: { icon: Factory, isNegative: false },
  defectCount: { icon: AlertTriangle, isNegative: true },
  yieldRate: { icon: TrendingUp, isNegative: false },
  downtimeAlerts: { icon: Clock, isNegative: true },
  utilizationRate: { icon: Gauge, isNegative: false },
};

//! =============== 純函式：資料轉換 ===============

/**
 * 決定趨勢方向
 */
function getTrendDirection(trend: number): TrendDirection {
  if (trend > 0) return "up";
  if (trend < 0) return "down";
  return "stable";
}

/**
 * 決定趨勢顏色
 *
 * 💡 負面指標顏色反轉：
 * - 一般指標：up = green, down = red
 * - 負面指標：up = red, down = green
 */
function getTrendColor(trend: number, isNegative: boolean): TrendColor {
  if (trend === 0) return "gray";

  const isUp = trend > 0;

  if (isNegative) {
    return isUp ? "red" : "green";
  }
  return isUp ? "green" : "red";
}

/**
 * 格式化趨勢變化文字
 */
function formatChange(trend: number): string {
  const sign = trend >= 0 ? "+" : "";
  return `${sign}${trend}%`;
}

/**
 * 記錄效能指標
 */
function recordKPITime(startTime: number): void {
  const duration = performance.now() - startTime;
  usePerformanceStore.getState().recordMetric("KPI API Time", duration);
}

/**
 * 格式化數值 (千分位)
 */
function formatValue(value: number): string {
  return value.toLocaleString("en-US");
}

/**
 * API 資料轉換為 UI 格式
 *
 * 💡 包含效能監控：測量轉換時間並寫入 PerformanceStore
 */
function transformMetrics(data: KPIData): StatCardData[] {
  const startTime = performance.now();

  const result = (Object.entries(data) as [keyof KPIData, KPIItem][]).map(
    ([key, item]) => {
      const config = METRIC_CONFIG[key];
      const trendDirection = getTrendDirection(item.trend);
      const color = getTrendColor(item.trend, config.isNegative);

      return {
        key,
        value: formatValue(item.value),
        unit: item.unit,
        change: formatChange(item.trend),
        trend: trendDirection,
        color,
        icon: config.icon,
      };
    }
  );

  recordKPITime(startTime);
  return result;
}

//! =============== Hook ===============

export interface UseKPIMetricsReturn {
  data: StatCardData[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * KPI 指標資料 Hook
 *
 * @example
 * const { data, isLoading, isError } = useKPIMetrics();
 */
export function useKPIMetrics(): UseKPIMetricsReturn {
  const { data: rawData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["kpi"],
    queryFn: fetchKPI,
    refetchInterval: POLLING_INTERVAL,
    staleTime: POLLING_INTERVAL / 2,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  //* 轉換資料：API → UI 格式
  const data = useMemo(() => {
    if (!rawData) return [];
    return transformMetrics(rawData);
  }, [rawData]);

  return {
    data,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}
