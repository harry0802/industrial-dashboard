/**
 * Chart.Legend - 配置組件
 *
 * ⚠️ 這是一個「配置載體」，不會自行渲染任何內容。
 * 實際渲染由 ChartCanvas 的 Render Hijacking 機制處理。
 *
 * @see ../utils/renderers.ts - renderLegend()
 */

export interface ChartLegendProps {
  /** 是否可點擊切換 series 顯示 */
  enableToggle?: boolean;
  /** 垂直對齊 */
  verticalAlign?: "top" | "middle" | "bottom";
}

/**
 * 配置組件 - 不渲染任何內容
 * ChartCanvas 會讀取 props 並轉譯為 Recharts 原生 Legend
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ChartLegend(_props: ChartLegendProps): null {
  return null;
}

ChartLegend.displayName = "ChartLegend";
