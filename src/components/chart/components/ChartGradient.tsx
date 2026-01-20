/**
 * Chart.Gradient
 *
 * SVG 漸層定義
 * - 放在 <Chart.Canvas> 內使用
 * - 用於 Area chart 的填充漸層
 */

export interface ChartGradientProps {
  /** 漸層 ID (用於 fill="url(#id)") */
  id: string;
  /** 顏色 (CSS color 或 var) */
  color: string;
  /** 起始透明度 */
  startOpacity?: number;
  /** 結束透明度 */
  endOpacity?: number;
}

export function ChartGradient({
  id,
  color,
  startOpacity = 0.8,
  endOpacity = 0,
}: ChartGradientProps) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={color} stopOpacity={startOpacity} />
        <stop offset="95%" stopColor={color} stopOpacity={endOpacity} />
      </linearGradient>
    </defs>
  );
}
