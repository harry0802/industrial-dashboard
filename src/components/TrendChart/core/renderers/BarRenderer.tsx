import { Bar, Line } from "recharts";
import type { RendererProps } from "../types";

/**
 * Bar Chart Renderer
 */
export function BarRenderer({ data, isDragging, colors }: RendererProps) {
  return (
    <>
      {/* Production 用柱狀圖 */}
      <Bar
        dataKey="production"
        yAxisId="left"
        fill={colors.production}
        name="Output"
        isAnimationActive={!isDragging}
      />

      {/* Defect 也用柱狀圖 */}
      <Bar
        dataKey="defectCount"
        yAxisId="left"
        fill={colors.defect}
        name="Defect"
        isAnimationActive={!isDragging}
      />

      {/* Yield 用線圖 (右軸) */}
      <Line
        type="monotone"
        dataKey="yield"
        yAxisId="right"
        stroke={colors.defect}
        strokeWidth={2}
        dot={false}
        name="Yield Rate"
        isAnimationActive={!isDragging}
      />

      {/* Utilization 用線圖 (右軸) */}
      <Line
        type="monotone"
        dataKey="utilization"
        yAxisId="right"
        stroke={colors.utilization}
        strokeDasharray="5 5"
        strokeWidth={2}
        dot={false}
        name="Utilization"
        isAnimationActive={!isDragging}
      />
    </>
  );
}
