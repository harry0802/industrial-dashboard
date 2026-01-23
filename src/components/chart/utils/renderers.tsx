/**
 * Chart Render Utilities
 *
 * ! Core Architecture: Render Hijacking (渲染劫持)
 * 這些函數由 ChartCanvas 呼叫，將配置組件轉換為 Recharts 原生組件。
 * 配置組件 (ChartSeries, ChartTooltip 等) 本身不渲染任何內容。
 *
 * @see ../components/ChartCanvas.tsx - 使用這些渲染函數
 */

import type { ReactElement } from "react";
import {
  Line,
  Area,
  Bar,
  Tooltip,
  Legend,
  Brush,
  ComposedChart,
} from "recharts";
import { cn } from "@/lib/utils";
import type { ChartConfig, BrushChangeEvent } from "../types";
import type { ChartSeriesProps } from "../components/ChartSeries";
import type { ChartTooltipProps } from "../components/ChartTooltip";
import type { ChartLegendProps } from "../components/ChartLegend";
import type { ChartBrushProps } from "../components/ChartBrush";

//! =============== Type Definitions ===============

interface TooltipPayloadItem {
  dataKey?: string | number;
  name?: string;
  value?: number;
  color?: string;
}

interface LegendPayloadItem {
  value: string;
  dataKey?: string | number;
  color?: string;
}

interface BrushContext {
  data: Record<string, unknown>[];
  xDataKey: string;
  range: { startIndex: number; endIndex: number };
  setRange: (r: { startIndex: number; endIndex: number }) => void;
}

//! =============== Internal UI Components ===============

//* Tooltip 單一項目渲染
function TooltipItem({
  item,
  config,
}: {
  item: TooltipPayloadItem;
  config: ChartConfig;
}) {
  const key = String(item.dataKey || item.name || "value");
  const itemConfig = config[key];
  const label =
    typeof itemConfig?.label === "string" ? itemConfig.label : item.name;
  const formattedValue =
    typeof item.value === "number" ? item.value.toLocaleString() : item.value;

  return (
    <div className="flex w-full items-center justify-between gap-2">
      <div className="flex items-center gap-1.5">
        <div
          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
          style={{ backgroundColor: item.color }}
        />
        <span className="text-muted-foreground">{label}</span>
      </div>
      <span className="text-foreground font-mono font-medium tabular-nums">
        {formattedValue}
      </span>
    </div>
  );
}

//* Legend 單一項目渲染
function LegendItem({
  entry,
  isHidden,
  enableToggle,
  onToggle,
  config,
}: {
  entry: LegendPayloadItem;
  isHidden: boolean;
  enableToggle?: boolean;
  onToggle?: (key: string) => void;
  config: ChartConfig;
}) {
  const dataKey = String(entry.dataKey ?? entry.value);
  const itemConfig = config[dataKey];
  const label =
    typeof itemConfig?.label === "string" ? itemConfig.label : entry.value;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggle?.(dataKey);
  };

  return (
    <button
      key={dataKey}
      type="button"
      className={cn(
        "flex items-center gap-1.5 text-sm transition-opacity",
        enableToggle ? "cursor-pointer hover:opacity-80" : "cursor-default",
        isHidden && "opacity-40",
      )}
      onClick={handleClick}
    >
      <span
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: entry.color }}
      />
      <span className={cn(isHidden && "line-through")}>{label}</span>
    </button>
  );
}

//! =============== Exported UI Components ===============

/** Tooltip 內容容器 */
export function CustomTooltipContent({
  active,
  payload,
  label,
  config,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  config: ChartConfig;
}) {
  if (!active || !payload?.length) return null;

  const validItems = payload.filter((item) => item.value !== undefined);

  return (
    <div className="border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
      {label && <div className="font-medium">{label}</div>}
      <div className="grid gap-1.5">
        {validItems.map((item) => (
          <TooltipItem
            key={String(item.dataKey || item.name || "value")}
            item={item}
            config={config}
          />
        ))}
      </div>
    </div>
  );
}

/** Legend 內容容器 */
export function CustomLegendContent({
  payload,
  hiddenSeries,
  onToggle,
  config,
  enableToggle,
}: {
  payload?: LegendPayloadItem[];
  hiddenSeries: Set<string>;
  onToggle?: (dataKey: string) => void;
  config: ChartConfig;
  enableToggle?: boolean;
}) {
  if (!payload?.length) return null;

  return (
    <div className="flex flex-wrap justify-center gap-4 pt-2">
      {payload.map((entry) => {
        const dataKey = String(entry.dataKey ?? entry.value);
        return (
          <LegendItem
            key={dataKey}
            entry={entry}
            isHidden={hiddenSeries.has(dataKey)}
            enableToggle={enableToggle}
            onToggle={onToggle}
            config={config}
          />
        );
      })}
    </div>
  );
}

//! =============== Render Functions ===============

/** 渲染圖表序列 (Line/Area/Bar) */
export function renderSeries(
  child: ReactElement<ChartSeriesProps>,
  config: ChartConfig,
  hiddenSeries: Set<string>,
) {
  const {
    dataKey,
    name,
    type = "line",
    curveType = "monotone",
    color,
    fill,
    fillOpacity,
    strokeWidth = 2,
    strokeDasharray,
    dot = false,
    isAnimationActive = false,
    ...rest
  } = child.props;

  const isHidden = hiddenSeries.has(dataKey);
  const seriesConfig = config[dataKey];

  //* 樣式計算 (優先使用 Props -> 其次 CSS Variable)
  const strokeColor = color || `var(--color-${dataKey})`;
  const fillColor = fill || color || `var(--color-${dataKey})`;
  const finalName =
    name ||
    (typeof seriesConfig?.label === "string" ? seriesConfig.label : dataKey);

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

  if (type === "area") {
    return (
      <Area
        {...commonProps}
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
        fillOpacity={isHidden ? 0 : (fillOpacity ?? 0.8)}
        radius={[4, 4, 0, 0]}
      />
    );
  }

  return (
    <Line
      {...commonProps}
      type={curveType}
      dot={dot}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      strokeOpacity={isHidden ? 0 : 1}
    />
  );
}

/** 渲染 Tooltip */
export function renderTooltip(
  child: ReactElement<ChartTooltipProps>,
  config: ChartConfig,
) {
  return (
    <Tooltip
      cursor={child.props.cursor}
      content={({ active, payload, label }) => (
        <CustomTooltipContent
          active={active}
          payload={payload as TooltipPayloadItem[]}
          label={label}
          config={config}
        />
      )}
    />
  );
}

/** 渲染 Legend */
export function renderLegend(
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
          payload={payload as LegendPayloadItem[]}
          hiddenSeries={hiddenSeries}
          onToggle={toggleSeries}
          config={config}
          enableToggle={child.props.enableToggle}
        />
      )}
    />
  );
}

/** 渲染 Brush */
export function renderBrush(
  child: ReactElement<ChartBrushProps>,
  context: BrushContext,
) {
  const { previewDataKey, height = 30 } = child.props;
  const { data, xDataKey, range, setRange } = context;

  const handleChange = (e: BrushChangeEvent) => {
    if (e?.startIndex !== undefined && e?.endIndex !== undefined) {
      setRange({ startIndex: e.startIndex, endIndex: e.endIndex });
    }
  };

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
