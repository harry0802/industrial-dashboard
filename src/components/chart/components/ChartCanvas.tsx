/**
 * Chart.Canvas
 *
 * 負責渲染 ResponsiveContainer + ComposedChart
 * - 處理滑鼠事件 (拖曳選取縮放)
 * - 渲染 ReferenceArea 選取區域
 * - 傳遞 canvasRef 給 context (供 wheel zoom 使用)
 */

import { useCallback, useMemo, type ReactNode } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  ReferenceArea,
} from "recharts";
import { useChartData, useChartInteraction } from "../context/ChartContext";
import type { ChartMouseEvent } from "../types";
import { cn } from "@/lib/utils";

export interface ChartCanvasProps {
  children: ReactNode;
  height?: number;
  debounce?: number;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  className?: string;
  /** 顯示 grid */
  showGrid?: boolean;
}

export function ChartCanvas({
  children,
  height = 400,
  debounce = 0,
  margin = { top: 10, right: 10, left: 0, bottom: 0 },
  className,
  showGrid = true,
}: ChartCanvasProps) {
  const { data } = useChartData();
  const { selection, setSelection, commitSelection, canvasRef } =
    useChartInteraction();

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (e: ChartMouseEvent) => {
      if (!e?.activeLabel) return;
      setSelection({
        startX: e.activeLabel,
        endX: e.activeLabel,
        isSelecting: true,
      });
    },
    [setSelection],
  );

  const handleMouseMove = useCallback(
    (e: ChartMouseEvent) => {
      if (e?.activeLabel && selection.isSelecting) {
        setSelection((prev) => ({
          ...prev,
          endX: e.activeLabel ?? prev.endX,
        }));
      }
    },
    [selection.isSelecting, setSelection],
  );

  const handleMouseUp = useCallback(() => {
    if (!selection.isSelecting) return;
    commitSelection();
  }, [selection.isSelecting, commitSelection]);

  // Memoize event handlers object for Recharts
  const eventHandlers = useMemo(
    () => ({
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
    }),
    [handleMouseDown, handleMouseMove, handleMouseUp],
  );

  if (!data?.length) {
    return (
      <div className="text-muted-foreground flex items-center justify-center h-[200px]">
        無資料
      </div>
    );
  }

  return (
    <div
      ref={canvasRef}
      className={cn("w-full", className)}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%" debounce={debounce}>
        <ComposedChart data={data} margin={margin} {...eventHandlers}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border))"
            />
          )}

          {children}

          {/* Selection overlay */}
          {selection.isSelecting && selection.startX && selection.endX && (
            <ReferenceArea
              x1={selection.startX}
              x2={selection.endX}
              strokeOpacity={0.3}
              fill="hsl(var(--primary))"
              fillOpacity={0.1}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
