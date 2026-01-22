/**
 * Chart Compound Components
 *
 * IoC (控制反轉) 設計：
 * - 使用者決定 Reset 按鈕放哪
 * - 使用者決定 Series 的渲染順序
 * - 使用者可以自由使用原生 Recharts XAxis, YAxis
 *
 * @example
 * ```tsx
 * <Chart.Root data={data} config={config} xDataKey="time">
 *   <Card>
 *     <CardHeader>
 *       <CardTitle>生產趨勢</CardTitle>
 *       <Chart.ResetButton />
 *     </CardHeader>
 *     <CardContent>
 *       <Chart.Canvas height={380}>
 *         <XAxis dataKey="time" />
 *         <YAxis yAxisId="left" />
 *         <Chart.Series dataKey="production" type="area" />
 *         <Chart.Tooltip />
 *         <Chart.Legend />
 *         <Chart.Brush />
 *       </Chart.Canvas>
 *     </CardContent>
 *   </Card>
 * </Chart.Root>
 * ```
 */

// Components
import { ChartRoot } from "./components/ChartRoot";
import { ChartCanvas } from "./components/ChartCanvas";
import { ChartSeries } from "./components/ChartSeries";
import { ChartBrush } from "./components/ChartBrush";
import { ChartResetButton } from "./components/ChartResetButton";
import { ChartTooltip } from "./components/ChartTooltip";
import { ChartLegend } from "./components/ChartLegend";
import { ChartGradient } from "./components/ChartGradient";

// Namespace export
export const Chart = {
  Root: ChartRoot,
  Canvas: ChartCanvas,
  Series: ChartSeries,
  Brush: ChartBrush,
  ResetButton: ChartResetButton,
  Tooltip: ChartTooltip,
  Legend: ChartLegend,
  Gradient: ChartGradient,
};

// Named exports for direct imports
export {
  ChartRoot,
  ChartCanvas,
  ChartSeries,
  ChartBrush,
  ChartResetButton,
  ChartTooltip,
  ChartLegend,
  ChartGradient,
};

// Context hooks
export { useChartData, useChartInteraction, useChart } from "./context/ChartContext";

// Types
export type {
  ChartConfig,
  ChartConfigItem,
  RangeState,
  SelectionState,
  SeriesType,
  SeriesProps,
} from "./types";

export type { ChartRootProps } from "./components/ChartRoot";
export type { ChartCanvasProps } from "./components/ChartCanvas";
export type { ChartSeriesProps } from "./components/ChartSeries";
export type { ChartBrushProps } from "./components/ChartBrush";
export type { ChartResetButtonProps } from "./components/ChartResetButton";
export type { ChartTooltipProps } from "./components/ChartTooltip";
export type { ChartLegendProps } from "./components/ChartLegend";
export type { ChartGradientProps } from "./components/ChartGradient";
