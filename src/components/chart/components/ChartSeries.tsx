/**
 * Chart.Series
 *
 * 封裝 Recharts 的 Line, Area, Bar
 * - 直接返回 Recharts 組件 (避免 children 型別驗證問題)
 * - 自動從 context 讀取 hidden 狀態
 * - 支援 CSS variable 顏色
 */

import { Line, Area, Bar } from "recharts";
import { useChartData, useChartInteraction } from "../context/ChartContext";
import type { SeriesProps, SeriesType } from "../types";

export interface ChartSeriesProps extends SeriesProps {
  /** 圖表類型 */
  type?: SeriesType;
  /** 線條/填充類型 */
  curveType?: "monotone" | "linear" | "step" | "basis";
  /** 是否顯示點 */
  dot?: boolean;
  /** 動畫 */
  isAnimationActive?: boolean;
}

export function ChartSeries({
  dataKey,
  type = "line",
  yAxisId = "left",
  color,
  name,
  strokeWidth = 2,
  fillOpacity,
  strokeDasharray,
  fill,
  curveType = "monotone",
  dot = false,
  isAnimationActive = false,
}: ChartSeriesProps) {
  const { config } = useChartData();
  const { hiddenSeries } = useChartInteraction();

  const isHidden = hiddenSeries.has(dataKey);
  const seriesConfig = config[dataKey];

  // 顏色：優先使用傳入的 color，否則使用 CSS variable
  const strokeColor = color || `var(--color-${dataKey})`;
  const fillColor = fill || color || `var(--color-${dataKey})`;

  const commonProps = {
    dataKey,
    yAxisId,
    stroke: strokeColor,
    fill: fillColor,
    name:
      name ||
      (typeof seriesConfig?.label === "string" ? seriesConfig.label : dataKey),
    isAnimationActive,
    hide: isHidden,
  };

  switch (type) {
    case "area":
      return (
        <Area
          {...commonProps}
          type={curveType}
          fillOpacity={isHidden ? 0 : (fillOpacity ?? 0.2)}
          strokeOpacity={isHidden ? 0 : 1}
          strokeWidth={strokeWidth}
        />
      );

    case "bar":
      return (
        <Bar
          {...commonProps}
          fillOpacity={isHidden ? 0 : (fillOpacity ?? 0.8)}
          radius={[4, 4, 0, 0]}
        />
      );

    default:
      return (
        <Line
          {...commonProps}
          type={curveType}
          strokeWidth={strokeWidth}
          strokeOpacity={isHidden ? 0 : 1}
          dot={dot}
          strokeDasharray={strokeDasharray}
        />
      );
  }
}
