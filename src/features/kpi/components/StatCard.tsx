/**
 * StatCard - KPI 統計卡片
 *
 * 純展示組件 (Presentational Component)
 * - 顏色邏輯已由 useKPIMetrics 計算完成
 * - 組件只負責渲染
 */

import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type {
  StatCardData,
  TrendDirection,
  TrendColor,
} from "../hooks/useKPIMetrics";

//! =============== 常量配置 ===============

const TREND_ICONS: Record<TrendDirection, LucideIcon> = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

const COLOR_CLASSES: Record<TrendColor, { text: string; bg: string }> = {
  green: { text: "text-green-600", bg: "bg-green-500/10" },
  red: { text: "text-red-600", bg: "bg-red-500/10" },
  yellow: { text: "text-yellow-600", bg: "bg-yellow-500/10" },
  blue: { text: "text-blue-600", bg: "bg-blue-500/10" },
  gray: { text: "text-gray-600", bg: "bg-gray-500/10" },
};

//! =============== 型別定義 ===============

interface StatCardProps {
  stat: StatCardData;
  className?: string;
}

//! =============== 組件 ===============

/**
 * KPI 統計卡片
 *
 * @performance 使用 React.memo 避免不必要重繪
 */
const StatCard = React.memo(function StatCard({
  stat,
  className = "",
}: StatCardProps) {
  //* 查表取得圖示和顏色
  const TrendIcon = useMemo(() => TREND_ICONS[stat.trend], [stat.trend]);
  const colors = useMemo(() => COLOR_CLASSES[stat.color], [stat.color]);

  return (
    <Card className={`${className}from-primary/5 bg-linear-to-t to-card`}>
      <CardContent>
        {/* Header: 標籤 + Badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{stat.label}</span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}
          >
            <TrendIcon className="h-3 w-3" />
            {stat.change}
          </span>
        </div>

        {/* 數值 - 大字體 */}
        <p className="mt-2 text-3xl font-bold tracking-tight">{stat.value}</p>

        {/* 底部描述 */}
        <p className="mt-3 text-sm text-muted-foreground">
          {stat.trend === "up" && "Trending up this period"}
          {stat.trend === "down" && "Trending down this period"}
          {stat.trend === "stable" && "Stable this period"}
        </p>
      </CardContent>
    </Card>
  );
});

StatCard.displayName = "StatCard";

export { StatCard };
export type { StatCardProps };
