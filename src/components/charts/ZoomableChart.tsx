import { useState, useCallback, useMemo, useRef, useEffect } from "react";
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
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

//! =============== 型別定義 ===============

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
  dualYAxis?: boolean;
  xAxisFormatter?: (value: string) => string;
  className?: string;
  zoomSpeed?: number;
}

interface RangeState {
  startIndex: number;
  endIndex: number;
}

interface SelectionState {
  startX: string | null;
  endX: string | null;
}

//! =============== 工具函數 ===============

/**
 * 節流函數 - 控制函數執行頻率
 */
function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * RequestAnimationFrame 節流 - 用於視覺更新
 */
function rafThrottle<T extends (...args: any[]) => void>(
  func: T,
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (rafId !== null) return;

    rafId = requestAnimationFrame(() => {
      func.apply(this, args);
      rafId = null;
    });
  };
}

//! =============== 純計算邏輯 ===============

const MIN_ZOOM_ITEMS = 5;

/**
 * 計算縮放後的範圍 (支援滑鼠焦點縮放)
 */
function calculateNewRange(
  currentRange: RangeState,
  totalLength: number,
  zoomAmount: number,
  focusPercentage: number,
): RangeState {
  const { startIndex, endIndex } = currentRange;

  // 防止範圍小於最小限制且還在繼續放大
  if (endIndex - startIndex <= MIN_ZOOM_ITEMS && zoomAmount > 0) {
    return currentRange;
  }

  // zoomAmount > 0 : 放大 (縮小範圍)
  // zoomAmount < 0 : 縮小 (擴大範圍)
  const newStart = Math.max(
    0,
    startIndex + Math.floor(zoomAmount * focusPercentage),
  );

  const newEnd = Math.min(
    totalLength - 1,
    endIndex - Math.ceil(zoomAmount * (1 - focusPercentage)),
  );

  // 防呆：如果計算結果導致交叉，則不更新
  if (newStart >= newEnd - MIN_ZOOM_ITEMS) {
    return currentRange;
  }

  return { startIndex: newStart, endIndex: newEnd };
}

//! =============== 優化後的 Hook ===============

function useWheelZoom(
  ref: React.RefObject<HTMLDivElement>,
  range: RangeState,
  onRangeChange: (newRange: RangeState) => void,
  totalLength: number,
  zoomSpeed: number = 0.1,
) {
  const lastTouchDistance = useRef<number | null>(null);

  // 穩定的回調引用，避免 effect 重新訂閱
  const rangeRef = useRef(range);
  const onRangeChangeRef = useRef(onRangeChange);

  useEffect(() => {
    rangeRef.current = range;
  }, [range]);

  useEffect(() => {
    onRangeChangeRef.current = onRangeChange;
  }, [onRangeChange]);

  useEffect(() => {
    const element = ref.current;
    if (!element || totalLength === 0) return;

    // 通用縮放處理 - 使用 ref 避免閉包陷阱
    const performZoom = (direction: number, clientX: number) => {
      const currentRange = rangeRef.current;
      const { startIndex, endIndex } = currentRange;
      const currentLength = endIndex - startIndex;

      // 邊界檢查
      if (currentLength <= MIN_ZOOM_ITEMS && direction > 0) return;

      const zoomAmount = currentLength * zoomSpeed * direction;
      const rect = element.getBoundingClientRect();
      const mouseX = clientX - rect.left;
      const focusPercentage = Math.max(0, Math.min(1, mouseX / rect.width));

      const newRange = calculateNewRange(
        currentRange,
        totalLength,
        zoomAmount,
        focusPercentage,
      );

      if (
        newRange.startIndex !== currentRange.startIndex ||
        newRange.endIndex !== currentRange.endIndex
      ) {
        onRangeChangeRef.current(newRange);
      }
    };

    // 節流處理 - 16ms (60fps)
    const throttledZoom = rafThrottle(performZoom);

    // 滑鼠滾輪事件
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const direction = e.deltaY < 0 ? 1 : -1;
      throttledZoom(direction, e.clientX);
    };

    // 觸控事件
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        lastTouchDistance.current = null;
      }
    };

    // 觸控移動節流
    const handleTouchMove = throttle((e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      e.preventDefault();

      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY,
      );

      if (lastTouchDistance.current !== null) {
        const direction = currentDistance > lastTouchDistance.current ? 1 : -1;
        const centerClientX = (touch1.clientX + touch2.clientX) / 2;
        performZoom(direction, centerClientX);
      }

      lastTouchDistance.current = currentDistance;
    }, 16);

    element.addEventListener("wheel", handleWheel, { passive: false });
    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove as any, {
      passive: false,
    });

    return () => {
      element.removeEventListener("wheel", handleWheel);
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove as any);
    };
  }, [ref, totalLength, zoomSpeed]);
}

//! =============== 主組件 ===============

export function ZoomableChart<T extends Record<string, unknown>>({
  data,
  xDataKey,
  series,
  height = 400,
  showBrush = true,
  showResetButton = true,
  dualYAxis = false,
  xAxisFormatter,
  className,
  zoomSpeed = 0.1,
}: ZoomableChartProps<T>) {
  // 合併相關狀態
  const [range, setRange] = useState<RangeState>(() => ({
    startIndex: 0,
    endIndex: Math.max(0, data.length - 1),
  }));

  const [selection, setSelection] = useState<SelectionState>({
    startX: null,
    endX: null,
  });

  const isSelectingRef = useRef(false); // 使用 ref 避免頻繁渲染
  const chartRef = useRef<HTMLDivElement>(null);

  // 資料長度變化時重置範圍
  useEffect(() => {
    setRange({
      startIndex: 0,
      endIndex: Math.max(0, data.length - 1),
    });
  }, [data.length]);

  // 使用優化後的 Hook
  useWheelZoom(chartRef, range, setRange, data.length, zoomSpeed);

  // 快取配置
  const chartConfig = useMemo(() => buildChartConfig(series), [series]);

  // 快取計算結果
  const isZoomed = useMemo(
    () => range.startIndex > 0 || range.endIndex < data.length - 1,
    [range.startIndex, range.endIndex, data.length],
  );

  // 穩定的事件處理器
  const handleBrushChange = useCallback((e: any) => {
    if (e?.startIndex !== undefined && e?.endIndex !== undefined) {
      setRange({ startIndex: e.startIndex, endIndex: e.endIndex });
    }
  }, []);

  const handleMouseDown = useCallback((e: any) => {
    if (!e?.activeLabel) return;
    isSelectingRef.current = true;
    setSelection({ startX: e.activeLabel, endX: e.activeLabel });
  }, []);

  // 使用 ref + throttle 優化滑鼠移動
  const handleMouseMove = useMemo(
    () =>
      rafThrottle((e: any) => {
        if (isSelectingRef.current && e?.activeLabel) {
          setSelection((prev) => ({ ...prev, endX: e.activeLabel }));
        }
      }),
    [],
  );

  const handleMouseUp = useCallback(() => {
    isSelectingRef.current = false;

    setSelection((prevSelection) => {
      if (
        prevSelection.startX &&
        prevSelection.endX &&
        prevSelection.startX !== prevSelection.endX
      ) {
        const startIdx = data.findIndex(
          (item) => item[xDataKey] === prevSelection.startX,
        );
        const endIdx = data.findIndex(
          (item) => item[xDataKey] === prevSelection.endX,
        );

        if (startIdx !== -1 && endIdx !== -1) {
          const [min, max] = [startIdx, endIdx].sort((a, b) => a - b);
          setRange({ startIndex: min, endIndex: max });
        }
      }

      return { startX: null, endX: null };
    });
  }, [data, xDataKey]);

  const handleReset = useCallback(() => {
    setRange({ startIndex: 0, endIndex: Math.max(0, data.length - 1) });
  }, [data.length]);

  // 早期返回，避免無效渲染
  if (!data?.length) {
    return <div className="text-muted-foreground">無資料</div>;
  }

  return (
    <div className={`w-full space-y-2 ${className || ""}`} ref={chartRef}>
      {showResetButton && isZoomed && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-8 gap-1 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" /> 重置縮放
          </Button>
        </div>
      )}

      <ChartContainer
        config={chartConfig}
        className="w-full"
        style={{ height }}
      >
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />

              <XAxis
                dataKey={xDataKey}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={32}
                tickFormatter={xAxisFormatter}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />

              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              {dualYAxis && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
              )}

              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <ChartLegend content={<ChartLegendContent />} />

              {series.map((s) => {
                const common = {
                  key: s.dataKey,
                  dataKey: s.dataKey,
                  yAxisId: s.yAxisId || "left",
                  stroke: `var(--color-${s.dataKey})`,
                  fill: `var(--color-${s.dataKey})`,
                  name: s.name,
                };
                if (s.type === "area")
                  return (
                    <Area
                      {...common}
                      type="monotone"
                      fillOpacity={s.fillOpacity ?? 0.2}
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                  );
                if (s.type === "bar")
                  return (
                    <Bar
                      {...common}
                      fillOpacity={s.fillOpacity ?? 0.8}
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={false}
                    />
                  );
                return (
                  <Line
                    {...common}
                    type="monotone"
                    strokeWidth={s.strokeWidth ?? 2}
                    dot={false}
                    strokeDasharray={s.strokeDasharray}
                    isAnimationActive={false}
                  />
                );
              })}

              {isSelectingRef.current && selection.startX && selection.endX && (
                <ReferenceArea
                  x1={selection.startX}
                  x2={selection.endX}
                  strokeOpacity={0.3}
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                />
              )}

              {showBrush && (
                <Brush
                  dataKey={xDataKey}
                  height={30}
                  tickFormatter={() => ""}
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--background))"
                  startIndex={range.startIndex}
                  endIndex={range.endIndex}
                  onChange={handleBrushChange}
                  className="mt-4"
                >
                  <ComposedChart data={data}>
                    {series.slice(0, 1).map((s) => (
                      <Line
                        key={s.dataKey}
                        dataKey={s.dataKey}
                        type="monotone"
                        stroke={`var(--color-${s.dataKey})`}
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
          </ResponsiveContainer>
        </div>
      </ChartContainer>
    </div>
  );
}

//! =============== 輔助函數 ===============

/**
 * 建立 Chart Config
 */
function buildChartConfig(series: SeriesConfig[]): ChartConfig {
  const config: ChartConfig = {};
  series.forEach((s) => {
    config[s.dataKey] = {
      label: s.name,
      color: s.color,
    };
  });
  return config;
}
