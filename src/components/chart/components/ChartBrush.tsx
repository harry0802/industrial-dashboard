/**
 * Chart.Brush
 *
 * 封裝 Recharts Brush
 * - 自動綁定 context range (雙向綁定)
 * - 支援預覽線條
 */

import { useCallback } from "react";
import { Brush, ComposedChart, Line } from "recharts";
import { useChartData, useChartInteraction } from "../context/ChartContext";
import type { BrushChangeEvent } from "../types";

export interface ChartBrushProps {
  height?: number;
  /** 在 Brush 中預覽的 dataKey */
  previewDataKey?: string;
}

export function ChartBrush({ height = 30, previewDataKey }: ChartBrushProps) {
  const { data, xDataKey } = useChartData();
  const { range, setRange } = useChartInteraction();

  const handleChange = useCallback(
    (e: BrushChangeEvent) => {
      if (e?.startIndex !== undefined && e?.endIndex !== undefined) {
        setRange({ startIndex: e.startIndex, endIndex: e.endIndex });
      }
    },
    [setRange],
  );

  const previewChart = previewDataKey ? (
    <ComposedChart data={data}>
      <Line
        dataKey={previewDataKey}
        type="monotone"
        stroke={`var(--color-${previewDataKey})`}
        strokeWidth={1}
        dot={false}
        isAnimationActive={false}
        opacity={0.5}
      />
    </ComposedChart>
  ) : undefined;

  return (
    <Brush
      dataKey={xDataKey}
      height={height}
      tickFormatter={() => ""}
      stroke="hsl(var(--primary))"
      fill="hsl(var(--background))"
      startIndex={range.startIndex}
      endIndex={range.endIndex}
      onChange={handleChange}
    >
      {previewChart}
    </Brush>
  );
}
