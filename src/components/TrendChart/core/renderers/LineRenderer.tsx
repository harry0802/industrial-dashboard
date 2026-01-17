import { Line } from "recharts";
import type { RendererProps } from "../types";

/**
 * Line Chart Renderer
 */
export function LineRenderer({ data, isDragging, colors }: RendererProps) {
  return (
    <>
      <Line
        type="monotone"
        dataKey="production"
        yAxisId="left"
        stroke={colors.production}
        strokeWidth={2}
        dot={false}
        name="Output"
        isAnimationActive={!isDragging}
      />

      <Line
        type="monotone"
        dataKey="defectCount"
        yAxisId="left"
        stroke={colors.defect}
        strokeWidth={2}
        dot={false}
        name="Defect"
        isAnimationActive={!isDragging}
      />

      <Line
        type="monotone"
        dataKey="yield"
        yAxisId="right"
        stroke={colors.yield}
        strokeWidth={2}
        dot={false}
        name="Yield Rate"
        isAnimationActive={!isDragging}
      />

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
