import { useContext } from "react";
import { TrendChartContext } from "./TrendChartContext";

/**
 * 🪝 useTrendChart Hook
 *
 * 子組件透過這個 hook 取得共享狀態
 *
 * @throws {Error} 如果在 TrendChart.Root 外使用
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { chartType, setChartType } = useTrendChart();
 *   return <button onClick={() => setChartType('line')}>Switch to Line</button>;
 * }
 * ```
 */
export function useTrendChart() {
  const context = useContext(TrendChartContext);

  if (!context) {
    throw new Error(
      "useTrendChart must be used within TrendChart.Root. " +
      "Wrap your component with <TrendChart.Root> to provide context."
    );
  }

  return context;
}
