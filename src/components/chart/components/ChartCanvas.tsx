/**
 * src/components/chart/components/ChartCanvas.tsx
 *
 * ! Core Architecture: Render Hijacking (渲染劫持)
 * 此組件攔截 React Children，並將自定義配置組件 (ChartSeries 等)
 * 轉換為 Recharts 原生組件，同時自動注入 Context 狀態。
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
  Line,
  Area,
  Bar,
  Tooltip,
  Legend,
  Brush,
} from "recharts";
import { useChartData, useChartInteraction } from "../context/ChartContext";
import type { ChartMouseEvent, BrushChangeEvent, ChartConfig } from "../types";
import { cn } from "@/lib/utils";

// Component Types
import { ChartSeries, type ChartSeriesProps } from "./ChartSeries";
import { ChartTooltip, type ChartTooltipProps } from "./ChartTooltip";
import { ChartLegend, type ChartLegendProps } from "./ChartLegend";
import { ChartBrush, type ChartBrushProps } from "./ChartBrush";

// =========================================================================
// 🎨 Internal Render Helpers (獨立渲染邏輯，降低主組件認知負荷)
// =========================================================================

/** 渲染圖表序列 (Line/Area/Bar) */
function renderSeries(
  child: ReactElement<ChartSeriesProps>,
  config: ChartConfig,
  hiddenSeries: Set<string>,
) {
  const {
    // 識別與數據
    dataKey,
    name,

    // 圖表類型配置
    type = "line", // 決定渲染 Line, Area 還是 Bar
    curveType = "monotone", // 對應 Recharts 的 type (線條插值)

    // 樣式配置
    color,
    fill,
    fillOpacity,
    strokeWidth = 2,
    strokeDasharray,
    dot = false,

    // 效能配置 (預設關閉動畫以提升效能)
    isAnimationActive = false,

    ...rest
  } = child.props;

  // 1. 狀態與配置查找
  const isHidden = hiddenSeries.has(dataKey);
  const seriesConfig = config[dataKey];

  // 2. 樣式計算 (優先使用 Props -> 其次 CSS Variable)
  const strokeColor = color || `var(--color-${dataKey})`;
  const fillColor = fill || color || `var(--color-${dataKey})`;
  const finalName =
    name ||
    (typeof seriesConfig?.label === "string" ? seriesConfig.label : dataKey);

  // 3. 通用 Props (所有圖表類型共用)
  const commonProps = {
    key: dataKey,
    dataKey,
    name: finalName,
    stroke: strokeColor,
    fill: fillColor,
    hide: isHidden,
    isAnimationActive,
    ...rest,
  };

  // 4. 根據類型渲染對應 Recharts 組件
  if (type === "area") {
    return (
      <Area
        {...commonProps}
        // Area 特有屬性映射
        type={curveType}
        strokeWidth={strokeWidth}
        fillOpacity={isHidden ? 0 : (fillOpacity ?? 0.2)}
        strokeOpacity={isHidden ? 0 : 1}
      />
    );
  }

  if (type === "bar") {
    return (
      <Bar
        {...commonProps}
        // Bar 特有屬性映射
        fillOpacity={isHidden ? 0 : (fillOpacity ?? 0.8)}
        radius={[4, 4, 0, 0]}
      />
    );
  }

  // 預設為 Line
  return (
    <Line
      {...commonProps}
      // Line 特有屬性映射
      type={curveType}
      dot={dot}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      strokeOpacity={isHidden ? 0 : 1}
    />
  );
}

/** 渲染 Tooltip (注入自定義樣式) */
function renderTooltip(
  child: ReactElement<ChartTooltipProps>,
  config: ChartConfig,
) {
  return (
    <Tooltip
      cursor={child.props.cursor}
      content={({ active, payload, label }) => (
        <CustomTooltipContent
          active={active}
          payload={payload}
          label={label}
          config={config}
        />
      )}
    />
  );
}

/** 渲染 Legend (注入互動邏輯) */
function renderLegend(
  child: ReactElement<ChartLegendProps>,
  hiddenSeries: Set<string>,
  toggleSeries: (key: string) => void,
  config: ChartConfig,
) {
  return (
    <Legend
      verticalAlign={child.props.verticalAlign || "bottom"}
      content={({ payload }) => (
        <CustomLegendContent
          payload={payload}
          hiddenSeries={hiddenSeries}
          onToggle={toggleSeries}
          config={config}
          enableToggle={child.props.enableToggle}
        />
      )}
    />
  );
}

/** 渲染 Brush (注入 Range 與 Preview) */
function renderBrush(
  child: ReactElement<ChartBrushProps>,
  context: {
    data: any[];
    xDataKey: string;
    range: { startIndex: number; endIndex: number };
    setRange: (r: { startIndex: number; endIndex: number }) => void;
  },
) {
  const { previewDataKey, height = 30 } = child.props;
  const { data, xDataKey, range, setRange } = context;

  // 渲染內部預覽圖表
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
      onChange={(e: BrushChangeEvent) => {
        if (e?.startIndex !== undefined && e?.endIndex !== undefined) {
          setRange({ startIndex: e.startIndex, endIndex: e.endIndex });
        }
      }}
    >
      {previewChart}
    </Brush>
  );
}

// =========================================================================
// 🧩 Display Components
// =========================================================================

function CustomTooltipContent({ active, payload, label, config }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
      {label && <div className="font-medium">{label}</div>}
      <div className="grid gap-1.5">
        {payload
          .filter((item: any) => item.value !== undefined)
          .map((item: any) => {
            const key = String(item.dataKey || item.name || "value");
            const itemConfig = config[key];
            return (
              <div
                key={key}
                className="flex w-full items-center justify-between gap-2"
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">
                    {typeof itemConfig?.label === "string"
                      ? itemConfig.label
                      : item.name}
                  </span>
                </div>
                <span className="text-foreground font-mono font-medium tabular-nums">
                  {typeof item.value === "number"
                    ? item.value.toLocaleString()
                    : item.value}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

function CustomLegendContent({
  payload,
  hiddenSeries,
  onToggle,
  config,
  enableToggle,
}: any) {
  if (!payload?.length) return null;

  return (
    <div className="flex flex-wrap justify-center gap-4 pt-2">
      {payload.map((entry: any) => {
        const dataKey = String(entry.dataKey ?? entry.value);
        const isHidden = hiddenSeries.has(dataKey);
        const itemConfig = config[dataKey];

        return (
          <button
            key={dataKey}
            type="button"
            className={cn(
              "flex items-center gap-1.5 text-sm transition-opacity",
              enableToggle
                ? "cursor-pointer hover:opacity-80"
                : "cursor-default",
              isHidden && "opacity-40",
            )}
            onClick={(e) => {
              e.preventDefault();
              onToggle?.(dataKey);
            }}
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className={cn(isHidden && "line-through")}>
              {typeof itemConfig?.label === "string"
                ? itemConfig.label
                : entry.value}
            </span>
          </button>
        );
      })}
    </div>
  );
}

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

      const type = child.type as any;
      const displayName = type.displayName || type.name;

      //* 1. ChartSeries
      if (type === ChartSeries || displayName === "ChartSeries") {
        return renderSeries(
          child as ReactElement<ChartSeriesProps>,
          config,
          hiddenSeries,
        );
      }

      //* 2. ChartTooltip
      if (type === ChartTooltip || displayName === "ChartTooltip") {
        return renderTooltip(child as ReactElement<ChartTooltipProps>, config);
      }

      //* 3. ChartLegend
      if (type === ChartLegend || displayName === "ChartLegend") {
        return renderLegend(
          child as ReactElement<ChartLegendProps>,
          hiddenSeries,
          toggleSeries,
          config,
        );
      }

      //* 4. ChartBrush
      if (type === ChartBrush || displayName === "ChartBrush") {
        return renderBrush(child as ReactElement<ChartBrushProps>, {
          data,
          xDataKey,
          range,
          setRange,
        });
      }

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
