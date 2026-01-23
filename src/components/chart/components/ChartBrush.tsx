/**
 * Chart.Brush - 配置組件
 *
 * ⚠️ 這是一個「配置載體」，不會自行渲染任何內容。
 * 實際渲染由 ChartCanvas 的 Render Hijacking 機制處理。
 *
 * @see ../utils/renderers.ts - renderBrush()
 */

export interface ChartBrushProps {
  /** Brush 高度 */
  height?: number;
  /** 在 Brush 中預覽的 dataKey */
  previewDataKey?: string;
}

/**
 * 配置組件 - 不渲染任何內容
 * ChartCanvas 會讀取 props 並轉譯為 Recharts 原生 Brush
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ChartBrush(_props: ChartBrushProps): null {
  return null;
}

ChartBrush.displayName = "ChartBrush";
