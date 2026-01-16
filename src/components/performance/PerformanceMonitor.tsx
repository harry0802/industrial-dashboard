/**
 * 📊 效能監控面板
 * 即時顯示 API 請求效能指標的浮動面板
 * 使用 shadcn 組件系統 + MetricCard 語義組件
 */

import { useState } from "react";
import { Activity, ChevronDown, ChevronUp } from "lucide-react";
import { usePerformanceStore } from "@/stores/usePerformanceStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { formatDuration, getPerformanceColor } from "@/utils/format";

/**
 * PerformanceMonitor 組件 - 效能監控浮動面板
 *
 * @returns {JSX.Element} PerformanceMonitor 元素
 *
 * 🧠 設計決策:
 * - 使用 MetricCard 組件統一指標展示樣式
 * - 從 utils/format 引入格式化函數 (遵循 DRY 原則)
 * - 保持固定定位 (fixed bottom-4 right-4) 不影響主內容
 *
 * 💡 狀態管理:
 * - isExpanded: 控制面板展開/收起
 * - metrics: 從 Zustand Store 取得效能指標
 */
function PerformanceMonitor() {
  const [isExpanded, setIsExpanded] = useState(false);
  const metrics = usePerformanceStore((state) => state.metrics);

  // 💡 按時間戳排序指標 (最新的在最上方)
  const metricEntries = Object.values(metrics).sort(
    (a, b) => b.timestamp - a.timestamp
  );

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="overflow-hidden shadow-lg">
        {/* 🎯 Header - 可展開/收起的控制按鈕 */}
        <Button
          variant="ghost"
          className="w-full justify-between px-4 py-3 hover:bg-accent"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="font-semibold">效能監控</span>
            <span className="text-xs text-muted-foreground">
              ({metricEntries.length})
            </span>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </Button>

        {/* 📊 Metrics List - 使用 MetricCard 組件統一樣式 */}
        {isExpanded && (
          <div className="max-h-96 overflow-y-auto border-t p-3">
            {metricEntries.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                無監控數據
              </p>
            ) : (
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
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

export default PerformanceMonitor;
