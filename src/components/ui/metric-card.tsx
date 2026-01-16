/**
 * =====================================
 * 📊 MetricCard 組件 - 指標展示卡片
 * =====================================
 * 基於 shadcn Card 擴展的語義組件，用於展示效能指標或 KPI 數據
 * 遵循 shadcn/ui new-york style 設計規範
 */

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * @typedef {Object} MetricCardProps
 * @property {string} label - 指標名稱/標籤
 * @property {string} value - 指標數值 (已格式化)
 * @property {string} [valueColor] - 數值顏色類別 (可選)
 * @property {React.ReactNode} [icon] - 圖示元素 (可選)
 * @property {string} [className] - 額外的 CSS 類別 (可選)
 */
interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
  valueColor?: string;
  icon?: React.ReactNode;
}

/**
 * MetricCard 組件 - 用於展示單一指標
 *
 * @param {MetricCardProps} props - 組件屬性
 * @returns {JSX.Element} MetricCard 元素
 *
 * @example
 * <MetricCard
 *   label="API Response Time"
 *   value="450ms"
 *   valueColor="text-green-600"
 *   icon={<Activity className="h-4 w-4" />}
 * />
 */
function MetricCard({
  label,
  value,
  valueColor = "text-foreground",
  icon,
  className,
  ...props
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm",
        className
      )}
      {...props}
    >
      <span
        className="flex items-center gap-2 truncate font-medium"
        title={label}
      >
        {icon}
        {label}
      </span>
      <span className={cn("ml-2 font-mono", valueColor)}>{value}</span>
    </div>
  );
}

export { MetricCard };
export type { MetricCardProps };
