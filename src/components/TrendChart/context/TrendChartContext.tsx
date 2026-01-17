import { createContext } from "react";
import type { ChartType, ChartDataPoint } from "../core/types";

/**
 * 🧠 TrendChart Context
 *
 * 讓 Compound Components 之間共享狀態，無需 props drilling
 */
export interface TrendChartContextValue {
  // 數據
  data: ChartDataPoint[];

  // 圖表類型
  chartType: ChartType;
  setChartType: (type: ChartType) => void;

  // 窗口範圍
  windowRange: [number, number] | null;
  onWindowChange: (window: [number, number]) => void; // 🔄 窗口變更回調
  resetZoom: () => void;

  // 拖曳狀態
  isDragging: boolean;

  // Refs (用於匯出)
  chartRef: React.RefObject<HTMLDivElement>;
}

export const TrendChartContext = createContext<TrendChartContextValue | null>(
  null
);
