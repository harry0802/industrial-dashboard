/**
 * Chart.Series - 配置組件
 *
 * ⚠️ 這是一個「配置載體」，不會自行渲染任何內容。
 * 實際渲染由 ChartCanvas 的 Render Hijacking 機制處理。
 *
 * @see ../utils/renderers.ts - renderSeries()
 */

import type { SeriesType } from "../types";

export interface ChartSeriesProps {
  /** 資料鍵 (必填) */
  dataKey: string;
  /** 圖表類型 */
  type?: SeriesType;
  /** Y 軸 ID */
  yAxisId?: "left" | "right";
  /** 覆蓋 config 顏色 */
  color?: string;
  /** 顯示名稱 */
  name?: string;
  /** 線條寬度 */
  strokeWidth?: number;
  /** 填充透明度 */
  fillOpacity?: number;
  /** 虛線樣式 */
  strokeDasharray?: string;
  /** 填充顏色 */
  fill?: string;
  /** 線條/填充類型 */
  curveType?: "monotone" | "linear" | "step" | "basis";
  /** 是否顯示點 */
  dot?: boolean;
  /** 動畫開關 (預設關閉以提升效能) */
  isAnimationActive?: boolean;
}

/**
 * 配置組件 - 不渲染任何內容
 * ChartCanvas 會讀取 props 並轉譯為 Recharts 原生組件
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ChartSeries(_props: ChartSeriesProps): null {
  return null;
}

ChartSeries.displayName = "ChartSeries";
