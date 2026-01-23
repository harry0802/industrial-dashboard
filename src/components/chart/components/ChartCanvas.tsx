/**
 * src/components/chart/components/ChartCanvas.tsx
 *
 * ! Core Architecture: Render Hijacking (渲染劫持)
 * 此組件攔截 React Children，並將自定義配置組件 (ChartSeries 等)
 * 轉換為 Recharts 原生組件，同時自動注入 Context 狀態。
 *
 * @see ../utils/renderers.ts - 所有渲染函數的實作
 */

import React, {
  useCallback,
  useMemo,
  isValidElement,
  type ReactNode,
  type ReactElement,
} from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  ReferenceArea,
} from "recharts";
import { useChartData, useChartInteraction } from "../context/ChartContext";
import type { ChartMouseEvent } from "../types";
import { cn } from "@/lib/utils";

// Config Components (配置組件 - 不渲染任何內容)
import { ChartSeries, type ChartSeriesProps } from "./ChartSeries";
import { ChartTooltip, type ChartTooltipProps } from "./ChartTooltip";
import { ChartLegend, type ChartLegendProps } from "./ChartLegend";
import { ChartBrush, type ChartBrushProps } from "./ChartBrush";

// Render Functions (渲染邏輯)
import {
  renderSeries,
  renderTooltip,
  renderLegend,
  renderBrush,
} from "../utils/renderers";

// =========================================================================
// 🚀 Main Component
// =========================================================================

export interface ChartCanvasProps {
  children: ReactNode;
  height?: number;
  debounce?: number;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  className?: string;
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
  const { data, config, xDataKey } = useChartData();
  const {
    selection,
    setSelection,
    commitSelection,
    canvasRef,
    hiddenSeries,
    toggleSeries,
    range,
    setRange,
  } = useChartInteraction();

  // 🖱️ Event Handlers
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

  const eventHandlers = useMemo(
    () => ({
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
    }),
    [handleMouseDown, handleMouseMove, handleMouseUp],
  );

  // 🔄 Render Hijacking Logic
  const renderChartChildren = useCallback(() => {
    return React.Children.map(children, (child) => {
      if (!isValidElement(child)) return child;

      const type = child.type as { displayName?: string; name?: string };
      const displayName = type.displayName || type.name;

      //* 1. ChartSeries → Line/Area/Bar
      if (type === ChartSeries || displayName === "ChartSeries") {
        return renderSeries(
          child as ReactElement<ChartSeriesProps>,
          config,
          hiddenSeries,
        );
      }

      //* 2. ChartTooltip → Recharts Tooltip
      if (type === ChartTooltip || displayName === "ChartTooltip") {
        return renderTooltip(child as ReactElement<ChartTooltipProps>, config);
      }

      //* 3. ChartLegend → Recharts Legend
      if (type === ChartLegend || displayName === "ChartLegend") {
        return renderLegend(
          child as ReactElement<ChartLegendProps>,
          hiddenSeries,
          toggleSeries,
          config,
        );
      }

      //* 4. ChartBrush → Recharts Brush
      if (type === ChartBrush || displayName === "ChartBrush") {
        return renderBrush(child as ReactElement<ChartBrushProps>, {
          data,
          xDataKey,
          range,
          setRange,
        });
      }

      // 其他組件 (如原生 XAxis, YAxis) 直接傳遞
      return child;
    });
  }, [
    children,
    config,
    hiddenSeries,
    toggleSeries,
    range,
    setRange,
    data,
    xDataKey,
  ]);

  if (!data?.length) {
    return (
      <div className="text-muted-foreground flex items-center justify-center h-[200px]">
        無資料
      </div>
    );
  }

  return (
    <div ref={canvasRef} className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%" debounce={debounce}>
        <ComposedChart data={data} margin={margin} {...eventHandlers}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border))"
            />
          )}

          {renderChartChildren()}

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
