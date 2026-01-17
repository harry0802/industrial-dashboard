import { useTrendChart } from "../context";
import { Canvas as CoreCanvas } from "../core/Canvas";

interface CanvasWrapperProps {
  className?: string;
  enableZoom?: boolean;
  enablePan?: boolean;
}

/**
 * 🎨 TrendChart.Canvas - 圖表渲染器 (Wrapper)
 *
 * 連接 Context 狀態與底層 Canvas 組件
 *
 * @example
 * ```tsx
 * <TrendChart.Root data={data}>
 *   <TrendChart.Canvas enableZoom enablePan />
 * </TrendChart.Root>
 * ```
 */
export function CanvasWrapper({
  className,
  enableZoom = true,
  enablePan = true,
}: CanvasWrapperProps) {
  const {
    data,
    chartType,
    setChartType,
    windowRange,
    onWindowChange,
    isDragging,
  } = useTrendChart();

  return (
    <CoreCanvas
      data={data}
      chartType={chartType}
      onChartTypeChange={setChartType}
      currentWindow={windowRange ?? undefined}
      onWindowChange={onWindowChange} // 🔄 現在 Root 可以知道 window 變更了
      isDragging={isDragging}
      className={className}
      enableZoom={enableZoom}
      enablePan={enablePan}
    />
  );
}

// 🎯 重新命名匯出為 Canvas（供 Compound API 使用）
export { CanvasWrapper as Canvas };
