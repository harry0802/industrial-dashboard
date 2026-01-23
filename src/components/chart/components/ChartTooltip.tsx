/**
 * Chart.Tooltip - 配置組件
 *
 * ⚠️ 這是一個「配置載體」，不會自行渲染任何內容。
 * 實際渲染由 ChartCanvas 的 Render Hijacking 機制處理。
 *
 * @see ../utils/renderers.ts - renderTooltip()
 */

export interface ChartTooltipProps {
  /** 游標樣式 */
  cursor?: boolean | object;
  /** 指示器樣式 */
  indicator?: "dot" | "line" | "dashed";
}

/**
 * 配置組件 - 不渲染任何內容
 * ChartCanvas 會讀取 props 並轉譯為 Recharts 原生 Tooltip
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ChartTooltip(_props: ChartTooltipProps): null {
  return null;
}

ChartTooltip.displayName = "ChartTooltip";
