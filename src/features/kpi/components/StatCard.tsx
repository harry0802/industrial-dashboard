/**
 * StatCard - KPI 統計卡片
 *
 * 純展示組件 (Presentational Component)
 * - 顏色邏輯已由 useKPIMetrics 計算完成
 * - 組件只負責渲染
 */

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
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

//* Light/Dark mode 對比度優化
const COLOR_CLASSES: Record<TrendColor, { text: string; bg: string }> = {
  green: { text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  red: { text: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" },
  yellow: { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  blue: { text: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
  gray: { text: "text-gray-600 dark:text-gray-400", bg: "bg-gray-500/10" },
};

//* API unit -> i18n key mapping
const UNIT_KEY_MAP: Record<string, string> = {
  Units: "units",
  Defects: "defects",
  Alerts: "alerts",
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
  const { t } = useTranslation();

  //* 查表取得圖示和顏色
  const TrendIcon = useMemo(() => TREND_ICONS[stat.trend], [stat.trend]);
  const colors = useMemo(() => COLOR_CLASSES[stat.color], [stat.color]);

  //* 翻譯標題 (使用 key 對應 i18n)
  const label = t(`kpi.metrics.${stat.key}`);

  //* 翻譯單位 (% 不翻譯)
  const translatedUnit = useMemo(() => {
    if (stat.unit === "%") return "%";
    const unitKey = UNIT_KEY_MAP[stat.unit];
    return unitKey ? t(`kpi.units.${unitKey}`) : stat.unit;
  }, [stat.unit, t]);

  return (
    <Card className={`${className}from-primary/5 bg-linear-to-t to-card`}>
      <CardContent>
        {/* Header: 標籤 + Badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}
          >
            <TrendIcon className="h-3 w-3" />
            {stat.change}
          </span>
        </div>

        {/* 數值 + 翻譯後單位 */}
        <p className="mt-2 text-3xl font-bold tracking-tight">
          {stat.value} {translatedUnit}
        </p>

        {/* 底部描述 */}
        <p className="mt-3 text-sm text-muted-foreground">
          {t(`kpi.trend.${stat.trend}`)}
        </p>
      </CardContent>
    </Card>
  );
});

StatCard.displayName = "StatCard";

export { StatCard };
export type { StatCardProps };
