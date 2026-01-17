import { Area, Line } from "recharts";
import type { RendererProps } from "../types";

/**
 * Area Chart Renderer
 *
 * 渲染 4 條數據線:
 * - Production (Area + Gradient)
 * - Defect (Line)
 * - Yield (Line - 右軸)
 * - Utilization (Line - 右軸虛線)
 */
export function AreaRenderer({ isDragging, colors }: RendererProps) {
  return (
    <>
      {/* 主要產量 (Area + Gradient) */}
      <Area
        type="monotone"
        dataKey="production"
        yAxisId="left"
        stroke={colors.production}
        fill="url(#colorProduction)"
        strokeWidth={2}
        name="Output"
        isAnimationActive={!isDragging}
      />

      {/* 瑕疵數 */}
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

      {/* 良率 (右軸百分比) */}
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

      {/* 稼動率 (右軸百分比 + 虛線) */}
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
