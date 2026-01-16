/**
 * =====================================
 * 📊 StatCard - KPI 統計卡片
 * =====================================
 * 顯示單一 KPI 指標，包含數值、變化趨勢、圖示
 */

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { StatMetric } from "@/mocks/data";
import { getColorClasses } from "@/mocks/data";

/**
 * @typedef {Object} StatCardProps
 * @property {StatMetric} stat - 統計指標資料
 */
interface StatCardProps {
  stat: StatMetric;
}

/**
 * StatCard 組件 - KPI 統計卡片
 *
 * @param props - 組件屬性
 * @param props.stat - 統計指標資料
 * @returns StatCard 元素
 *
 * 🧠 設計決策:
 * - 使用 shadcn Card 保持一致性
 * - 趨勢圖示根據 trend 動態渲染
 * - 顏色系統基於 Mock Data 定義
 *
 * 💡 視覺層次:
 * - Label (小標題) -> Value (主要數值) -> Change (變化趨勢)
 */
function StatCard({ stat }: StatCardProps) {
  const TrendIcon =
    stat.trend === "up"
      ? TrendingUp
      : stat.trend === "down"
      ? TrendingDown
      : Minus;

  const colors = getColorClasses(stat.color);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
          <div className={`rounded-full p-2 ${colors.bg}`}>
            <TrendIcon className={`h-4 w-4 ${colors.text}`} />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-sm">
          <span className={colors.text}>{stat.change}</span>
          <span className="text-muted-foreground">from last period</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCard;
