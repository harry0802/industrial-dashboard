/**
 *  效能監控面板
 */

import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Activity, AlertCircle } from "lucide-react";
import { usePerformanceStore } from "@/stores/usePerformanceStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/ui/metric-card";
import { formatDuration, getPerformanceColor } from "@/utils/format";
import { cn } from "@/lib/utils";

//! =============== 1. 類型定義 ===============

interface PerformanceMonitorProps {
  className?: string;
}

interface DisplayMetric {
  key: string;
  labelKey: string; // i18n key
  value: number;
  timestamp: number;
}

interface UsePerformanceReturn {
  metricEntries: DisplayMetric[];
  isEmpty: boolean;
}

//! =============== 指標白名單 + 翻譯 Key 映射 ===============

const METRIC_CONFIG: Record<string, string> = {
  "api/stats": "performance.metrics.kpiApi",
  "api/equipment/100000": "performance.metrics.equipmentApi",
  "api/chart": "performance.metrics.chartApi",
  "api/watchlist": "performance.metrics.watchlistApi",
  "Table Render Time": "performance.metrics.tableRender",
  "Table Processing Time": "performance.metrics.tableProcess",
  "Chart Reader Time": "performance.metrics.chartRender",
  "Total Page Render Time": "performance.metrics.pageLoad",
};

//! =============== 2. 核心邏輯 (Hook) ===============

/**
 * 效能資料邏輯 Hook
 * @description 只顯示白名單內的指標，並映射友善名稱
 */
function usePerformanceLogic(): UsePerformanceReturn {
  const metrics = usePerformanceStore((state) => state.metrics);

  const metricEntries = useMemo(() => {
    const result: DisplayMetric[] = [];

    for (const [storeKey, labelKey] of Object.entries(METRIC_CONFIG)) {
      const metric = metrics[storeKey];
      if (metric) {
        result.push({
          key: storeKey,
          labelKey,
          value: metric.value,
          timestamp: metric.timestamp,
        });
      }
    }

    //* 依 timestamp 降冪排序 (最新的置頂)
    return result.sort((a, b) => b.timestamp - a.timestamp);
  }, [metrics]);

  const isEmpty = metricEntries.length === 0;

  return { metricEntries, isEmpty };
}

//! =============== 3. 組件實作 ===============

/**
 * PerformanceMonitor 組件 - 效能監控面板
 * @description 與 WatchlistPanel 同樣風格的卡片組件
 *
 * 🧠 設計決策:
 * - 使用與 WatchlistPanel 一致的 Card 結構
 * - 移除 fixed 定位,改為 flex 佈局容器
 * - 保持 MetricCard 統一指標展示樣式
 */
function PerformanceMonitor({ className }: PerformanceMonitorProps) {
  const { t } = useTranslation();
  const { metricEntries, isEmpty } = usePerformanceLogic();

  // Push Ifs Up: 處理空狀態視圖
  if (isEmpty) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("performance.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-8 w-8 opacity-50" />
            <p>{t("performance.noData")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 渲染主視圖
  return (
    <Card className={cn("flex h-full flex-col", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <CardTitle className="text-base">
              {t("performance.title")}
            </CardTitle>
          </div>
          <Badge
            variant="secondary"
            className="px-2 py-0.5 text-xs font-normal"
          >
            {t("performance.units.metricsCount", {
              count: metricEntries.length,
            })}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto pr-2">
        <div className="space-y-2">
          {metricEntries.map((metric) => (
            <MetricCard
              key={metric.key}
              label={t(metric.labelKey)}
              value={formatDuration(metric.value)}
              valueColor={getPerformanceColor(metric.value)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(PerformanceMonitor);
