import { useState, useRef, type ReactNode } from "react";
import { TrendChartContext } from "../context";
import type { ChartDataPoint, ChartType } from "../core/types";

interface RootProps {
  data: ChartDataPoint[];
  children: ReactNode;
  defaultChartType?: ChartType;
}

/**
 * 🌳 TrendChart.Root - Provider 組件
 *
 * 提供共享狀態給所有子組件 (Compound Components Pattern)
 *
 * @example
 * ```tsx
 * <TrendChart.Root data={chartData}>
 *   <TrendChart.Canvas />
 *   <TrendChart.ResetButton />
 * </TrendChart.Root>
 * ```
 */
export function Root({ data, children, defaultChartType = "area" }: RootProps) {
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);
  const [windowRange, setWindowRange] = useState<[number, number] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // 🔄 Window 變更處理器（供 Canvas 回呼）
  const handleWindowChange = (window: [number, number]) => {
    setWindowRange(window);
  };

  const resetZoom = () => setWindowRange(null);

  return (
    <TrendChartContext.Provider
      value={{
        data,
        chartType,
        setChartType,
        windowRange,
        onWindowChange: handleWindowChange,
        resetZoom,
        isDragging,
        chartRef,
      }}
    >
      {children}
    </TrendChartContext.Provider>
  );
}
