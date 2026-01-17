import React from "react";
import type { StatMetric } from "@/mocks/data";
import StatCard from "./StatCard";

interface MetricsGridProps {
  stats: StatMetric[];
}

/**
 * 指標網格組件
 * @description 實現 Push Fors Down 原則，將迴圈邏輯封裝在此
 * @performance 使用 React.memo 避免資料未變動時的重繪
 */
export const MetricsGrid = React.memo(function MetricsGrid({
  stats,
}: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
});

MetricsGrid.displayName = "Dashboard.MetricsGrid";
