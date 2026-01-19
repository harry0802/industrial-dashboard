/**
 *  效能監控面板
 */

import { memo, useMemo } from "react";
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

interface UsePerformanceReturn {
  metricEntries: { name: string; value: number; timestamp: number }[];
  isEmpty: boolean;
}

//! =============== 2. 核心邏輯 (Hook) ===============

/**
 * 效能資料邏輯 Hook
 * @description 集中處理效能指標排序與判斷
 */
function usePerformanceLogic(): UsePerformanceReturn {
  const metrics = usePerformanceStore((state) => state.metrics);

  // 💡 按時間戳排序指標 (最新的在最上方)
  const metricEntries = useMemo(() => {
    return Object.values(metrics).sort((a, b) => b.timestamp - a.timestamp);
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
  const { metricEntries, isEmpty } = usePerformanceLogic();

  // Push Ifs Up: 處理空狀態視圖
  if (isEmpty) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Performance Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-8 w-8 opacity-50" />
            <p>無效能資料</p>
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
            <CardTitle className="text-base">Performance Monitor</CardTitle>
          </div>
          <Badge
            variant="secondary"
            className="px-2 py-0.5 text-xs font-normal"
          >
            {metricEntries.length} Metrics
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto pr-2">
        <div className="space-y-2">
          {metricEntries.map((metric) => (
            <MetricCard
              key={metric.name}
              label={metric.name}
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
