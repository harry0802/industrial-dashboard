import { AreaRenderer } from "./AreaRenderer";
import { LineRenderer } from "./LineRenderer";
import { BarRenderer } from "./BarRenderer";
import type { ChartTypeRegistry } from "../types";

/**
 * 🔌 預設渲染器註冊表
 *
 * 用戶可通過 `renderersMap` prop 擴展自定義渲染器
 */
export const defaultRenderers: ChartTypeRegistry = {
  area: AreaRenderer,
  line: LineRenderer,
  bar: BarRenderer,
};

/**
 * 🧩 建立自定義渲染器註冊表
 *
 * @example
 * ```tsx
 * import { HeatmapRenderer } from "./custom";
 *
 * const customRenderers = createCustomRegistry({
 *   heatmap: HeatmapRenderer,
 *   waterfall: WaterfallRenderer,
 * });
 *
 * <Chart.Canvas renderersMap={customRenderers} chartType="heatmap" />
 * ```
 */
export function createCustomRegistry(
  custom: Partial<ChartTypeRegistry>
): ChartTypeRegistry {
  return { ...defaultRenderers, ...custom };
}
