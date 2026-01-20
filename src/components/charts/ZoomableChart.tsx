/**
 * ZoomableChart - 可縮放圖表組件
 *
 * 參考 shadcn-chart-brush 實作
 * - 圖表顯示全部資料，由 Brush 的 startIndex/endIndex 控制可見範圍
 * - 拖曳選取 (ReferenceArea) 更新 range
 * - 支援 Line / Area / Bar 三種模式
 * - 支援雙 Y 軸 (左軸大數值、右軸百分比)
 */

import { useState, useCallback, useMemo, useRef } from "react";
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Brush,
  ReferenceArea,
} from "recharts";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
//! =============== 型別定義 ===============

//* Recharts mouse event type
interface ChartMouseEvent {
  activeLabel?: string | number;
}

export interface SeriesConfig {
  dataKey: string;
  type: "line" | "area" | "bar";
  color: string;
  name: string;
  yAxisId?: "left" | "right";
  strokeWidth?: number;
  fillOpacity?: number;
  strokeDasharray?: string;
}

export interface ZoomableChartProps<T extends Record<string, unknown>> {
  data: T[];
  xDataKey: string;
  series: SeriesConfig[];
  height?: number;
  showBrush?: boolean;
  showResetButton?: boolean;
  dualYAxis?: {
    leftLabel: string;
    rightLabel: string;
  };
  xAxisFormatter?: (value: string) => string;
  className?: string;
}

interface SelectionState {
  left: number | null;
  right: number | null;
}

interface RangeState {
  left: number;
  right: number;
}

//! =============== 常量配置 ===============

const CHART_MARGIN = { top: 10, right: 30, left: 0, bottom: 0 };
const BRUSH_HEIGHT = 50;

//! =============== 工具函數 ===============

//* 將 SeriesConfig[] 轉為 shadcn ChartConfig
function buildChartConfig(series: SeriesConfig[]): ChartConfig {
  const config: ChartConfig = {};
  for (const s of series) {
    config[s.dataKey] = {
      label: s.name,
      color: s.color,
    };
  }
  return config;
}

//! =============== 純函數：渲染 Series ===============

function renderSeries(config: SeriesConfig): React.ReactElement {
  const commonProps = {
    key: config.dataKey,
    dataKey: config.dataKey,
    name: config.name,
    yAxisId: config.yAxisId ?? "left",
    isAnimationActive: false,
  };

  switch (config.type) {
    case "line":
      return (
        <Line
          {...commonProps}
          type="monotone"
          stroke={`var(--color-${config.dataKey})`}
          strokeWidth={config.strokeWidth ?? 2}
          strokeDasharray={config.strokeDasharray}
          dot={false}
        />
      );
    case "area":
      return (
        <Area
          {...commonProps}
          type="monotone"
          stroke={`var(--color-${config.dataKey})`}
          fill={`var(--color-${config.dataKey})`}
          fillOpacity={config.fillOpacity ?? 0.3}
          strokeWidth={config.strokeWidth ?? 2}
        />
      );
    case "bar":
      return (
        <Bar
          {...commonProps}
          fill={`var(--color-${config.dataKey})`}
          fillOpacity={config.fillOpacity ?? 0.9}
          maxBarSize={50}
        />
      );
  }
}

//! =============== 主組件 ===============

export function ZoomableChart<T extends Record<string, unknown>>({
  data,
  xDataKey,
  series,
  height = 380,
  showBrush = true,
  showResetButton = true,
  dualYAxis,
  xAxisFormatter,
  className,
}: ZoomableChartProps<T>) {
  //* 縮放範圍狀態 - 控制 Brush 的 startIndex/endIndex
  const [range, setRange] = useState<RangeState>(() => ({
    left: 0,
    right: Math.max(0, data.length - 1),
  }));

  //* 拖曳選取狀態
  const [selection, setSelection] = useState<SelectionState>({
    left: null,
    right: null,
  });
  const [selecting, setSelecting] = useState(false);

  const chartRef = useRef<HTMLDivElement>(null);

  //* 將 series 轉為 ChartConfig
  const chartConfig = useMemo(() => buildChartConfig(series), [series]);

  //* 安全的 range（防止越界）
  const safeRange = useMemo(
    () => ({
      left: Math.max(0, Math.min(range.left, data.length - 1)),
      right: Math.max(0, Math.min(range.right, data.length - 1)),
    }),
    [range, data.length],
  );

  //* 是否已縮放
  const isZoomed = safeRange.left !== 0 || safeRange.right !== data.length - 1;

  //! =============== 事件處理 (參考 shadcn-chart-brush) ===============

  //* 🔥 關鍵：使用全資料 data 來找 index
  const handleMouseDown = useCallback(
    (e: ChartMouseEvent) => {
      if (e.activeLabel) {
        setSelection({
          left: data.findIndex((d) => d[xDataKey] === e.activeLabel),
          right: null,
        });
        setSelecting(true);
      }
    },
    [data, xDataKey],
  );

  const handleMouseMove = useCallback(
    (e: ChartMouseEvent) => {
      if (selecting && e.activeLabel) {
        setSelection((prev) => ({
          ...prev,
          right: data.findIndex((d) => d[xDataKey] === e.activeLabel),
        }));
      }
    },
    [selecting, data, xDataKey],
  );

  const handleMouseUp = useCallback(() => {
    if (selection.left !== null && selection.right !== null) {
      const [tempLeft, tempRight] = [selection.left, selection.right].sort(
        (a, b) => a - b,
      );
      setRange({ left: tempLeft, right: tempRight });
    }
    setSelection({ left: null, right: null });
    setSelecting(false);
  }, [selection]);

  const handleBrushChange = useCallback(
    (e: { startIndex?: number; endIndex?: number }) => {
      setRange({
        left: e.startIndex ?? 0,
        right: e.endIndex ?? data.length - 1,
      });
    },
    [data.length],
  );

  const handleReset = useCallback(() => {
    setRange({ left: 0, right: data.length - 1 });
  }, [data.length]);

  //! =============== 渲染 ===============

  // Guard Clause
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground"
        style={{ height }}
      >
        無圖表資料
      </div>
    );
  }

  return (
    <div className={className} ref={chartRef}>
      {/* Reset 按鈕 */}
      {showResetButton && isZoomed && (
        <div className="flex justify-end mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            重置縮放
          </Button>
        </div>
      )}

      <ChartContainer
        config={chartConfig}
        className="aspect-auto w-full"
        style={{ height }}
      >
        {/* 🔥 關鍵：顯示全資料 data，由 Brush 控制可見範圍 */}
        <ComposedChart
          data={data}
          margin={CHART_MARGIN}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          {/* X 軸 */}
          <XAxis
            dataKey={xDataKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={xAxisFormatter}
            style={{ userSelect: "none" }}
          />

          {/* Y 軸 */}
          {dualYAxis ? (
            <>
              <YAxis
                yAxisId="left"
                orientation="left"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={60}
                style={{ userSelect: "none" }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={60}
                style={{ userSelect: "none" }}
              />
            </>
          ) : (
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={60}
              style={{ userSelect: "none" }}
            />
          )}

          {/* Tooltip - 使用 shadcn ChartTooltip */}
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />

          {/* Legend - 使用 shadcn ChartLegend */}
          <ChartLegend content={<ChartLegendContent />} />

          {/* Series */}
          {series.map(renderSeries)}

          {/* 🔥 選取區域視覺 - 直接使用 data 的 xDataKey 值 */}
          {selection.left !== null && selection.right !== null && (
            <ReferenceArea
              x1={data[selection.left]?.[xDataKey] as string}
              x2={data[selection.right]?.[xDataKey] as string}
              fill="hsl(var(--primary))"
              fillOpacity={0.1}
              stroke="hsl(var(--primary))"
              strokeOpacity={0.3}
            />
          )}

          {/* 🔥 Brush - 控制可見範圍的關鍵 */}
          {showBrush && (
            <Brush
              dataKey={xDataKey}
              height={BRUSH_HEIGHT}
              startIndex={safeRange.left}
              endIndex={safeRange.right}
              onChange={handleBrushChange}
              stroke="hsl(var(--primary))"
              fill="hsl(var(--muted))"
              tickFormatter={xAxisFormatter}
            >
              {/* Brush 內的迷你圖表 */}
              <ComposedChart>
                {series.map((config) => (
                  <Line
                    key={config.dataKey}
                    dataKey={config.dataKey}
                    type="monotone"
                    stroke={config.color}
                    strokeWidth={1}
                    dot={false}
                    isAnimationActive={false}
                    opacity={0.5}
                  />
                ))}
              </ComposedChart>
            </Brush>
          )}
        </ComposedChart>
      </ChartContainer>
    </div>
  );
}
