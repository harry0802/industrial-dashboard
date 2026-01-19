import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Download,
  RotateCcw,
  BarChart3,
  LineChart,
  AreaChart,
} from "lucide-react";
import { toPng, toSvg } from "html-to-image";

// 型別定義
export interface ChartDataPoint {
  time: string;
  production: number;
  yield: number;
  efficiency: number;
  defectCount: number;
}

interface IndexedDataPoint extends ChartDataPoint {
  index: number;
}

const CHART_CONSTANTS = {
  HEIGHT: 350,
  MIN_ZOOM_POINTS: 5,
  DRAG_THRESHOLD: 15,
  ZOOM_FACTOR: 0.05,
  RESIZE_DEBOUNCE: 300,
  COLORS: {
    production: "#3b82f6",
    defect: "#ef4444",
    yield: "#10b981",
    utilization: "#8b5cf6",
  },
} as const;

export type ChartType = "area" | "line" | "bar";

interface TrendChartProps {
  data: ChartDataPoint[];
  chartType?: ChartType;
  onChartTypeChange?: (type: ChartType) => void;
  className?: string;
  enableZoom?: boolean;
  enablePan?: boolean;
}

export function TrendChart({
  data,
  chartType: initialChartType = "area",
  className,
  enableZoom = true,
  enablePan = true,
}: TrendChartProps) {
  const [chartType, setChartType] = useState<ChartType>(initialChartType);
  const [windowRange, setWindowRange] = useState<[number, number] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const lastClientX = useRef<number>(0);
  const dragAccumulator = useRef<number>(0);

  // 重置縮放
  const handleReset = useCallback(() => {
    setWindowRange(null);
  }, []);

  // 圖例點擊切換顯示/隱藏
  const handleLegendClick = useCallback((e: any) => {
    const dataKey = e.dataKey;
    setHiddenSeries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dataKey)) {
        newSet.delete(dataKey);
      } else {
        newSet.add(dataKey);
      }
      return newSet;
    });
  }, []);

  // 💡 匯出選項（遵循 Props Stability 原則）
  const exportOptions = useMemo(
    () => ({
      png: {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      },
      svg: {
        backgroundColor: "#ffffff",
      },
    }),
    []
  );

  // 匯出為 PNG
  const handleExportPNG = useCallback(async () => {
    const container = chartContainerRef.current;
    if (!container) return;

    setIsExporting(true);
    // ✨ 等待動畫停止
    await new Promise((r) => setTimeout(r, 50));

    try {
      const dataUrl = await toPng(container, exportOptions.png);

      const link = document.createElement("a");
      link.download = `production-chart-${new Date()
        .toISOString()
        .slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("PNG Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  }, [exportOptions.png]);

  // 匯出為 SVG
  const handleExportSVG = useCallback(async () => {
    const container = chartContainerRef.current;
    if (!container) return;

    setIsExporting(true);
    await new Promise((r) => setTimeout(r, 50));

    try {
      const dataUrl = await toSvg(container, exportOptions.svg);

      const link = document.createElement("a");
      link.download = `production-chart-${new Date()
        .toISOString()
        .slice(0, 10)}.svg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("SVG Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  }, [exportOptions.svg]);

  const currentWindow = useMemo<[number, number]>(() => {
    if (windowRange) return windowRange;
    return [0, Math.max(0, data.length - 1)];
  }, [windowRange, data.length]);

  const indexedData = useMemo<IndexedDataPoint[]>(
    () =>
      data.map((item, i) => ({
        ...item,
        index: i,
        utilization: item.efficiency,
      })),
    [data]
  );

  // 🔍 根據 currentWindow 過濾顯示的資料
  const visibleData = useMemo(() => {
    const [start, end] = currentWindow;
    return indexedData.slice(Math.floor(start), Math.ceil(end) + 1);
  }, [indexedData, currentWindow]);

  const formatXAxis = useCallback(
    (index: number) => indexedData[index]?.time || "",
    [indexedData]
  );

  const stableProps = useMemo(
    () => ({
      xAxisProps: {
        dataKey: "index",
        type: "number" as const,
        domain: [currentWindow[0], currentWindow[1]],
        tickFormatter: formatXAxis,
        tick: { fontSize: 12, fill: "hsl(var(--muted-foreground))" },
      },
      yAxisLeftProps: {
        yAxisId: "left",
        label: { value: "Output", angle: -90, position: "insideLeft" as const },
      },
      yAxisRightProps: {
        yAxisId: "right",
        orientation: "right" as const,
        label: {
          value: "Rate (%)",
          angle: 90,
          position: "insideRight" as const,
        },
      },
      tooltipProps: {
        labelFormatter: formatXAxis,
        contentStyle: {
          backgroundColor: "hsl(var(--popover))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius)",
        },
      },
      legendProps: {
        iconType: "line" as const,
        wrapperStyle: { paddingTop: "1rem", cursor: "pointer" },
        onClick: handleLegendClick,
      },
      chartMargin: { top: 5, right: 30, left: 20, bottom: 5 },
    }),
    [currentWindow, formatXAxis, handleLegendClick]
  );

  // 滾輪縮放
  useEffect(() => {
    if (!enableZoom) return;

    const container = chartContainerRef.current;
    if (!container || data.length === 0) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const currentRange = windowRange || [0, data.length - 1];
      const [start, end] = currentRange;
      const currentLength = end - start;

      const direction = e.deltaY > 0 ? 1 : -1;
      const moveAmount = Math.max(
        1,
        Math.round(currentLength * CHART_CONSTANTS.ZOOM_FACTOR)
      );

      let newStart = start - direction * moveAmount;
      let newEnd = end + direction * moveAmount;

      if (newStart < 0) newStart = 0;
      if (newEnd > data.length - 1) newEnd = data.length - 1;

      if (newEnd - newStart < CHART_CONSTANTS.MIN_ZOOM_POINTS) {
        return;
      }

      setWindowRange([newStart, newEnd]);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [data.length, enableZoom, windowRange]);

  // 拖曳邏輯
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!enablePan) return;
      e.preventDefault();
      lastClientX.current = e.clientX;
      dragAccumulator.current = 0;
      setIsDragging(true);
    },
    [enablePan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!enablePan || !isDragging) return;

      const deltaX = e.clientX - lastClientX.current;
      lastClientX.current = e.clientX;
      dragAccumulator.current += deltaX;

      if (Math.abs(dragAccumulator.current) >= CHART_CONSTANTS.DRAG_THRESHOLD) {
        const steps = Math.trunc(
          dragAccumulator.current / CHART_CONSTANTS.DRAG_THRESHOLD
        );
        const moveIndexCount = -steps;

        if (moveIndexCount !== 0) {
          const current = windowRange || [0, data.length - 1];
          const [start, end] = current;
          const windowSize = end - start;
          const maxIndex = data.length - 1;

          let newStart = start + moveIndexCount;
          let newEnd = end + moveIndexCount;

          if (newStart < 0) {
            newStart = 0;
            newEnd = windowSize;
          }
          if (newEnd > maxIndex) {
            newEnd = maxIndex;
            newStart = maxIndex - windowSize;
          }

          setWindowRange([newStart, newEnd]);
          dragAccumulator.current -= steps * CHART_CONSTANTS.DRAG_THRESHOLD;
        }
      }
    },
    [enablePan, isDragging, windowRange, data.length]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragAccumulator.current = 0;
  }, []);

  const renderChart = () => {
    const commonProps = {
      isAnimationActive: !isDragging && !isExporting,
    };

    if (chartType === "bar") {
      return (
        <>
          <Bar
            dataKey="production"
            yAxisId="left"
            fill={CHART_CONSTANTS.COLORS.production}
            name="Output"
            hide={hiddenSeries.has("production")}
            {...commonProps}
          />
          <Bar
            dataKey="defectCount"
            yAxisId="left"
            fill={CHART_CONSTANTS.COLORS.defect}
            name="Defect"
            hide={hiddenSeries.has("defectCount")}
            {...commonProps}
          />
          <Line
            type="monotone"
            dataKey="yield"
            yAxisId="right"
            stroke={CHART_CONSTANTS.COLORS.yield}
            strokeWidth={2}
            dot={false}
            name="Yield Rate"
            hide={hiddenSeries.has("yield")}
            {...commonProps}
          />
          <Line
            type="monotone"
            dataKey="utilization"
            yAxisId="right"
            stroke={CHART_CONSTANTS.COLORS.utilization}
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={false}
            name="Utilization"
            hide={hiddenSeries.has("utilization")}
            {...commonProps}
          />
        </>
      );
    }

    if (chartType === "line") {
      return (
        <>
          <Line
            type="monotone"
            dataKey="production"
            yAxisId="left"
            stroke={CHART_CONSTANTS.COLORS.production}
            strokeWidth={2}
            dot={false}
            name="Output"
            hide={hiddenSeries.has("production")}
            {...commonProps}
          />
          <Line
            type="monotone"
            dataKey="defectCount"
            yAxisId="left"
            stroke={CHART_CONSTANTS.COLORS.defect}
            strokeWidth={2}
            dot={false}
            name="Defect"
            hide={hiddenSeries.has("defectCount")}
            {...commonProps}
          />
          <Line
            type="monotone"
            dataKey="yield"
            yAxisId="right"
            stroke={CHART_CONSTANTS.COLORS.yield}
            strokeWidth={2}
            dot={false}
            name="Yield Rate"
            hide={hiddenSeries.has("yield")}
            {...commonProps}
          />
          <Line
            type="monotone"
            dataKey="utilization"
            yAxisId="right"
            stroke={CHART_CONSTANTS.COLORS.utilization}
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={false}
            name="Utilization"
            hide={hiddenSeries.has("utilization")}
            {...commonProps}
          />
        </>
      );
    }

    return (
      <>
        <Area
          type="monotone"
          dataKey="production"
          yAxisId="left"
          stroke={CHART_CONSTANTS.COLORS.production}
          fill="url(#colorProduction)"
          strokeWidth={2}
          name="Output"
          hide={hiddenSeries.has("production")}
          {...commonProps}
        />
        <Line
          type="monotone"
          dataKey="defectCount"
          yAxisId="left"
          stroke={CHART_CONSTANTS.COLORS.defect}
          strokeWidth={2}
          dot={false}
          name="Defect"
          hide={hiddenSeries.has("defectCount")}
          {...commonProps}
        />
        <Line
          type="monotone"
          dataKey="yield"
          yAxisId="right"
          stroke={CHART_CONSTANTS.COLORS.yield}
          strokeWidth={2}
          dot={false}
          name="Yield Rate"
          hide={hiddenSeries.has("yield")}
          {...commonProps}
        />
        <Line
          type="monotone"
          dataKey="utilization"
          yAxisId="right"
          stroke={CHART_CONSTANTS.COLORS.utilization}
          strokeDasharray="5 5"
          strokeWidth={2}
          dot={false}
          name="Utilization"
          hide={hiddenSeries.has("utilization")}
          {...commonProps}
        />
      </>
    );
  };

  return (
    <div className={className}>
      {/* 標題列 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Production Trend</h3>

          {/* 提示文字 */}
          <div className="text-xs text-muted-foreground flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="text-base">🖱️</span>
              <span>Drag to pan</span>
            </span>
            <span className="text-muted-foreground/50">•</span>
            <span className="flex items-center gap-1">
              <span className="text-base">🔍</span>
              <span>Scroll to zoom</span>
            </span>
          </div>
        </div>

        {/* 控制按鈕 */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={!windowRange}
            title="Reset zoom"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" title="Change chart type">
                {chartType === "area" && <AreaChart className="h-4 w-4" />}
                {chartType === "line" && <LineChart className="h-4 w-4" />}
                {chartType === "bar" && <BarChart3 className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setChartType("area")}>
                <AreaChart className="mr-2 h-4 w-4" />
                Area
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChartType("line")}>
                <LineChart className="mr-2 h-4 w-4" />
                Line
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChartType("bar")}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Bar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" title="Export chart">
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPNG}>
                Export as PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportSVG}>
                Export as SVG
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 圖表容器 */}
      <div
        ref={chartContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: enablePan ? (isDragging ? "grabbing" : "grab") : "default",
          touchAction: "none",
        }}
      >
        <div>
          <ResponsiveContainer
            width="100%"
            height={CHART_CONSTANTS.HEIGHT}
            debounce={CHART_CONSTANTS.RESIZE_DEBOUNCE}
          >
            <ComposedChart data={visibleData} margin={stableProps.chartMargin}>
              <defs>
                <linearGradient
                  id="colorProduction"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={CHART_CONSTANTS.COLORS.production}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={CHART_CONSTANTS.COLORS.production}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted/40"
              />

              <XAxis {...stableProps.xAxisProps} />
              <YAxis {...stableProps.yAxisLeftProps} />
              <YAxis {...stableProps.yAxisRightProps} />

              <RechartsTooltip {...stableProps.tooltipProps} />
              <Legend {...stableProps.legendProps} />

              {renderChart()}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
