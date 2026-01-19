import React, { useMemo, useCallback } from "react";
import {
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  type XAxisProps,
  type YAxisProps,
} from "recharts";
import {
  useInteractiveChart,
  type LayoutDirection,
  type SeriesConfig,
} from "./context";
import { Series } from "./Series";

// =====================================================================
// Type Definitions
// =====================================================================

interface CanvasProps {
  children: React.ReactNode;
  layout?: LayoutDirection;
  height?: number;
  width?: number | `${number}%`;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  debounce?: number;
  showGrid?: boolean;
  gridProps?: Record<string, unknown>;
  leftAxisLabel?: string;
  rightAxisLabel?: string;
  xAxisProps?: Partial<XAxisProps>;
  yAxisLeftProps?: Partial<YAxisProps>;
  yAxisRightProps?: Partial<YAxisProps>;
  showLegend?: boolean;
  showTooltip?: boolean;
}

// =====================================================================
// Main Component
// =====================================================================

export function Canvas({
  children,
  layout = "horizontal",
  height = 350,
  width = "100%" as `${number}%`,
  margin = { top: 5, right: 30, left: 20, bottom: 5 },
  debounce = 300,
  showGrid = true,
  gridProps,
  leftAxisLabel = "",
  rightAxisLabel = "",
  xAxisProps,
  yAxisLeftProps,
  yAxisRightProps,
  showLegend = true,
  showTooltip = true,
}: CanvasProps) {
  const {
    visibleData,
    currentWindow,
    indexedData,
    isDragging,
    isExporting,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    enablePan,
    xDataKey,
    hiddenSeries,
    toggleSeries,
  } = useInteractiveChart();

  // 💡 解析 children 中的 Series 配置
  const seriesConfigs = useMemo(
    () => extractSeriesConfigs(children),
    [children]
  );
  const otherChildren = useMemo(
    () => extractOtherChildren(children),
    [children]
  );

  // 🔍 Format X-Axis based on xDataKey
  const formatXAxis = useCallback(
    (value: number) => {
      const dataPoint = indexedData[value];
      if (!dataPoint) return "";
      return String(dataPoint[xDataKey] || value);
    },
    [indexedData, xDataKey]
  );

  // 🧠 Stable props for Recharts (CRITICAL for performance)
  const xAxisConfig = useMemo(
    () => buildXAxisProps(layout, currentWindow, formatXAxis, xAxisProps),
    [layout, currentWindow, formatXAxis, xAxisProps]
  );

  const yAxisLeftConfig = useMemo(
    () =>
      buildYAxisLeftProps(layout, formatXAxis, leftAxisLabel, yAxisLeftProps),
    [layout, formatXAxis, leftAxisLabel, yAxisLeftProps]
  );

  const yAxisRightConfig = useMemo(
    () => buildYAxisRightProps(rightAxisLabel, yAxisRightProps),
    [rightAxisLabel, yAxisRightProps]
  );

  const legendConfig = useMemo(
    () => buildLegendProps(toggleSeries),
    [toggleSeries]
  );

  // 🔥 渲染 Series (動態轉換為 Recharts 元件)
  const renderSeries = useCallback(
    () =>
      renderSeriesComponents(
        seriesConfigs,
        hiddenSeries,
        isDragging,
        isExporting
      ),
    [seriesConfigs, hiddenSeries, isDragging, isExporting]
  );

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        cursor: enablePan ? (isDragging ? "grabbing" : "grab") : "default",
        touchAction: "none",
      }}
    >
      <ResponsiveContainer
        width={width}
        height={height}
        debounce={debounce}
      >
        <ComposedChart data={visibleData} margin={margin} layout={layout}>
          {/* Grid */}
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-muted/40"
              {...gridProps}
            />
          )}

          {/* Axes */}
          <XAxis {...xAxisConfig} />
          <YAxis {...yAxisLeftConfig} />
          <YAxis {...yAxisRightConfig} />

          {/* Tooltip */}
          {showTooltip && (
            <RechartsTooltip
              labelFormatter={formatXAxis}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
          )}

          {/* Legend */}
          {showLegend && <RechartsLegend {...legendConfig} />}

          {/* Series */}
          {renderSeries()}

          {/* 🔥 透傳其他子組件 (如 ReferenceLine, Brush) */}
          {otherChildren}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

Canvas.displayName = "InteractiveChart.Canvas";

// =====================================================================
// Pure Functions: Children Parsing
// =====================================================================

// 🧠 提取 Series 配置
function extractSeriesConfigs(children: React.ReactNode): SeriesConfig[] {
  const configs: SeriesConfig[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === Series) {
      configs.push(child.props as SeriesConfig);
    }
  });
  return configs;
}

// 🧠 提取非 Series 的子組件
function extractOtherChildren(children: React.ReactNode): React.ReactNode[] {
  const others: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type !== Series) {
      others.push(child);
    }
  });
  return others;
}

// =====================================================================
// Pure Functions: Axis Configuration
// =====================================================================

// 🧠 構建 XAxis Props
function buildXAxisProps(
  layout: LayoutDirection,
  currentWindow: [number, number],
  formatXAxis: (value: number) => string,
  overrides?: Partial<XAxisProps>
): XAxisProps {
  const isHorizontal = layout === "horizontal";

  return {
    dataKey: isHorizontal ? "__index" : undefined,
    type: "number",
    domain: isHorizontal ? [currentWindow[0], currentWindow[1]] : undefined,
    tickFormatter: isHorizontal ? formatXAxis : undefined,
    tick: { fontSize: 12, fill: "hsl(var(--muted-foreground))" },
    ...overrides,
  } as XAxisProps;
}

// 🧠 構建 YAxis Left Props
function buildYAxisLeftProps(
  layout: LayoutDirection,
  formatXAxis: (value: number) => string,
  leftAxisLabel: string,
  overrides?: Partial<YAxisProps>
): YAxisProps {
  const isHorizontal = layout === "horizontal";

  return {
    yAxisId: "left",
    type: isHorizontal ? "number" : "category",
    dataKey: isHorizontal ? undefined : "__index",
    tickFormatter: !isHorizontal ? formatXAxis : undefined,
    label: leftAxisLabel
      ? {
          value: leftAxisLabel,
          angle: -90,
          position: "insideLeft" as const,
        }
      : undefined,
    ...overrides,
  } as YAxisProps;
}

// 🧠 構建 YAxis Right Props
function buildYAxisRightProps(
  rightAxisLabel: string,
  overrides?: Partial<YAxisProps>
): YAxisProps {
  return {
    yAxisId: "right",
    orientation: "right" as const,
    type: "number" as const,
    label: rightAxisLabel
      ? {
          value: rightAxisLabel,
          angle: 90,
          position: "insideRight" as const,
        }
      : undefined,
    ...overrides,
  } as YAxisProps;
}

// 🧠 構建 Legend Props
function buildLegendProps(toggleSeries: (dataKey: string) => void) {
  return {
    iconType: "line" as const,
    wrapperStyle: { paddingTop: "1rem", cursor: "pointer" },
    onClick: (data: { dataKey?: unknown }) => {
      if (data.dataKey && typeof data.dataKey === "string") {
        toggleSeries(data.dataKey);
      }
    },
  };
}

// =====================================================================
// Pure Functions: Series Rendering
// =====================================================================

// 🧠 渲染所有 Series 組件
function renderSeriesComponents(
  seriesConfigs: SeriesConfig[],
  hiddenSeries: Set<string>,
  isDragging: boolean,
  isExporting: boolean
): React.ReactNode[] {
  const commonProps = {
    isAnimationActive: !isDragging && !isExporting,
  };

  return seriesConfigs.map((config) => {
    const isHidden = hiddenSeries.has(config.dataKey);

    // 💡 根據類型分發到對應渲染函數
    if (config.type === "line") {
      return renderLineSeries(config, isHidden, commonProps);
    }
    if (config.type === "area") {
      return renderAreaSeries(config, isHidden, commonProps);
    }
    if (config.type === "bar") {
      return renderBarSeries(config, isHidden, commonProps);
    }

    return null;
  });
}

// 🧠 渲染 Line Series
function renderLineSeries(
  config: SeriesConfig,
  isHidden: boolean,
  commonProps: { isAnimationActive: boolean }
) {
  const {
    type,
    color,
    dataKey,
    name,
    yAxisId,
    strokeWidth,
    fillOpacity,
    ...restProps
  } = config;

  return (
    <Line
      key={config.dataKey}
      type="monotone"
      dataKey={config.dataKey}
      stroke={config.color}
      strokeWidth={config.strokeWidth || 2}
      yAxisId={config.yAxisId || "left"}
      name={config.name || config.dataKey}
      dot={false}
      hide={isHidden}
      {...commonProps}
      {...restProps}
    />
  );
}

// 🧠 渲染 Area Series
function renderAreaSeries(
  config: SeriesConfig,
  isHidden: boolean,
  commonProps: { isAnimationActive: boolean }
) {
  const {
    type,
    color,
    dataKey,
    name,
    yAxisId,
    strokeWidth,
    fillOpacity,
    ...restProps
  } = config;

  return (
    <Area
      key={config.dataKey}
      type="monotone"
      dataKey={config.dataKey}
      stroke={config.color}
      fill={config.color}
      fillOpacity={config.fillOpacity || 0.3}
      strokeWidth={config.strokeWidth || 2}
      yAxisId={config.yAxisId || "left"}
      name={config.name || config.dataKey}
      hide={isHidden}
      {...commonProps}
      {...restProps}
    />
  );
}

// 🧠 渲染 Bar Series
function renderBarSeries(
  config: SeriesConfig,
  isHidden: boolean,
  commonProps: { isAnimationActive: boolean }
) {
  const {
    type,
    color,
    dataKey,
    name,
    yAxisId,
    strokeWidth,
    fillOpacity,
    ...restProps
  } = config;

  return (
    <Bar
      key={config.dataKey}
      dataKey={config.dataKey}
      fill={config.color}
      yAxisId={config.yAxisId || "left"}
      name={config.name || config.dataKey}
      hide={isHidden}
      {...commonProps}
      {...restProps}
    />
  );
}
