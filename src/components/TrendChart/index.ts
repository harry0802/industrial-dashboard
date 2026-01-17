/**
 * 🎨 TrendChart - 生產趨勢圖表組件
 *
 * ## 📦 Level 3 模組化架構
 *
 * 按功能/模組分組，遵循 React 專案資料夾結構最佳實踐
 *
 * ### 模組結構
 * ```
 * TrendChart/
 * ├── config/       # ⚙️ 配置模組
 * ├── context/      # 🧠 狀態管理模組
 * ├── components/   # 🎨 UI 組件模組
 * │   └── controls/ # 控制元件子模組
 * └── core/         # 🔧 核心引擎模組
 *     └── renderers/ # 渲染器子模組
 * ```
 *
 * ## 使用模式
 *
 * ### 1️⃣ Compound Components (推薦) - 完全解耦，像樂高一樣組合
 * ```tsx
 * import TrendChart from "@/components/TrendChart";
 *
 * <TrendChart.Root data={chartData}>
 *   <Card>
 *     <CardHeader>
 *       <div className="flex gap-2">
 *         <TrendChart.ResetButton />
 *         <TrendChart.TypeSelector />
 *         <TrendChart.ExportMenu />
 *       </div>
 *     </CardHeader>
 *     <CardContent>
 *       <TrendChart.Canvas />
 *     </CardContent>
 *   </Card>
 * </TrendChart.Root>
 * ```
 *
 * ### 2️⃣ 獨立 Canvas (無 Context) - 最大彈性
 * ```tsx
 * import { Canvas } from "@/components/TrendChart";
 *
 * <Canvas
 *   data={chartData}
 *   chartType="line"
 *   enableZoom
 *   enablePan
 * />
 * ```
 *
 * ### 3️⃣ 擴展圖表類型
 * ```tsx
 * import { Canvas, createCustomRegistry } from "@/components/TrendChart";
 *
 * const customRenderers = createCustomRegistry({
 *   heatmap: HeatmapRenderer,
 * });
 *
 * <Canvas renderersMap={customRenderers} chartType="heatmap" />
 * ```
 */

// 📦 從各模組匯入
import { Root, Canvas, ResetButton, TypeSelector, ExportMenu } from "./components";

// 🐻 Compound Components Pattern (像樂高一樣組合)
const TrendChart = {
  Root,
  Canvas,
  ResetButton,
  TypeSelector,
  ExportMenu,
};

export default TrendChart;

// 🦁 也可以單獨使用 Canvas (無 Context 依賴)
export { Canvas } from "./core/Canvas";

// 🔌 渲染器系統 (擴展性)
export {
  defaultRenderers,
  createCustomRegistry,
} from "./core/renderers/registry";

// 📐 型別匯出
export type {
  CanvasProps,
  ChartRenderer,
  ChartTypeRegistry,
  ChartType,
  ChartDataPoint, // 🎯 組件自己定義的資料契約
  RendererProps,
} from "./core/types";

// ⚙️ 常量匯出
export { CHART_CONSTANTS } from "./config";

// 🧠 Context 匯出 (進階使用)
export { useTrendChart } from "./context";
export type { TrendChartContextValue } from "./context";
