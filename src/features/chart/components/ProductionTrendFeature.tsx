/**
 * Production Trend Feature
 * - 整合真實 API (24h 歷史 + 5 分鐘即時更新)
 * - 支援 Zoom/Pan/Export/Mode Switch
 * - 顯示效能指標 (API Time + Reader Time)
 */

import { useState, useMemo } from "react";
import {
  InteractiveChart,
  useInteractiveChart,
  type LayoutDirection,
  type ChartType,
} from "@/components/charts/InteractiveChart";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Download,
  TrendingUp,
  BarChart3,
  ArrowRightLeft,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useChartData, type UseChartDataOptions } from "../hooks/useChartData";
import { useMetric } from "@/stores/usePerformanceStore";
import { formatDuration } from "@/utils/format";
import { cn } from "@/lib/utils";

//! =============== 1. 型別定義 ===============

interface Props {
  className?: string;
  /** Chart data hook 配置 */
  chartOptions?: UseChartDataOptions;
}

type ChartMode = "trend" | "comparison" | "ranking";

interface ChartModeConfig {
  layout: LayoutDirection;
  primaryType: ChartType;
  label: string;
}

interface SeriesConfig {
  dataKey: string;
  type: ChartType;
  color: string;
  name: string;
  yAxisId: "left" | "right";
  fillOpacity?: number;
  strokeWidth?: number;
  strokeDasharray?: string;
  stackId?: string;
  barSize?: number;
}

//! =============== 2. 常量配置 ===============

const CHART_MODES: Record<ChartMode, ChartModeConfig> = {
  trend: {
    layout: "horizontal",
    primaryType: "area",
    label: "趨勢檢視 (Area)",
  },
  comparison: {
    layout: "horizontal",
    primaryType: "bar",
    label: "產量比較 (Bar)",
  },
  ranking: {
    layout: "vertical",
    primaryType: "bar",
    label: "良率排名 (Horizontal Bar)",
  },
} as const;

//! =============== 3. Series 配置工廠 ===============

//* 根據圖表模式回傳對應的 Series 配置
//* Push Ifs Up: 把模式判斷集中在這裡，每個 builder 只負責單一模式

function buildTrendSeries(): SeriesConfig[] {
  return [
    {
      dataKey: "production",
      type: "area",
      color: "#3b82f6",
      name: "產量",
      yAxisId: "left",
      fillOpacity: 0.3,
    },
    {
      dataKey: "defectCount",
      type: "line",
      color: "#ef4444",
      name: "不良品",
      yAxisId: "left",
      strokeWidth: 2,
    },
    {
      dataKey: "downtime",
      type: "line",
      color: "#f59e0b",
      name: "停機次數",
      yAxisId: "left",
      strokeWidth: 2,
      strokeDasharray: "3 3",
    },
    {
      dataKey: "yield",
      type: "line",
      color: "#10b981",
      name: "良率 (%)",
      yAxisId: "right",
      strokeWidth: 2,
    },
    {
      dataKey: "efficiency",
      type: "line",
      color: "#8b5cf6",
      name: "稼動率 (%)",
      yAxisId: "right",
      strokeWidth: 2,
      strokeDasharray: "5 5",
    },
  ];
}

function buildComparisonSeries(): SeriesConfig[] {
  return [
    {
      dataKey: "production",
      type: "bar",
      color: "#3b82f6",
      name: "產量",
      yAxisId: "left",
      stackId: "stack1",
    },
    {
      dataKey: "defectCount",
      type: "bar",
      color: "#ef4444",
      name: "不良品",
      yAxisId: "left",
      stackId: "stack1",
    },
    {
      dataKey: "downtime",
      type: "bar",
      color: "#f59e0b",
      name: "停機次數",
      yAxisId: "left",
      stackId: "stack2",
    },
    {
      dataKey: "yield",
      type: "bar",
      color: "#10b981",
      name: "良率 (%)",
      yAxisId: "right",
    },
    {
      dataKey: "efficiency",
      type: "bar",
      color: "#8b5cf6",
      name: "稼動率 (%)",
      yAxisId: "right",
    },
  ];
}

function buildRankingSeries(dataLength: number): SeriesConfig[] {
  const barSize = Math.max(10, Math.min(40, 300 / dataLength));
  return [
    {
      dataKey: "production",
      type: "bar",
      color: "#3b82f6",
      name: "產量",
      yAxisId: "left",
      barSize,
    },
    {
      dataKey: "defectCount",
      type: "bar",
      color: "#ef4444",
      name: "不良品",
      yAxisId: "left",
      barSize,
    },
  ];
}

/**
 * 根據模式取得 Series 配置
 * @param mode - 圖表模式
 * @param dataLength - 資料筆數 (用於計算 bar 寬度)
 */
function getSeriesConfigs(mode: ChartMode, dataLength: number): SeriesConfig[] {
  if (mode === "ranking") return buildRankingSeries(dataLength);
  if (mode === "comparison") return buildComparisonSeries();
  return buildTrendSeries();
}

//! =============== 4. 子組件 ===============

/** Loading Skeleton */
function ChartSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-8" />
            ))}
          </div>
        </div>
        <Skeleton className="h-[350px] w-full" />
      </CardContent>
    </Card>
  );
}

/** Error Fallback */
function ChartError({
  error,
  onRetry,
}: {
  error: Error | null;
  onRetry: () => void;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center h-[350px] gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center">
            <p className="font-medium">無法載入圖表資料</p>
            <p className="text-sm text-muted-foreground">
              {error?.message || "發生未知錯誤"}
            </p>
          </div>
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            重試
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** Performance Badge - 顯示 API 和 Reader 時間 */
function PerformanceBadge() {
  const apiMetric = useMetric("api/chart");
  const readerMetric = useMetric("Chart Reader Time");

  if (!apiMetric && !readerMetric) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {apiMetric && <span>API: {formatDuration(apiMetric.value)}</span>}
      {apiMetric && readerMetric && <span>|</span>}
      {readerMetric && (
        <span>Reader: {formatDuration(readerMetric.value)}</span>
      )}
    </div>
  );
}

/** Chart Controls Toolbar */
function ChartControls({
  currentMode,
  onModeChange,
}: {
  currentMode: ChartMode;
  onModeChange: (mode: ChartMode) => void;
}) {
  const {
    zoomIn,
    zoomOut,
    resetZoom,
    exportPNG,
    exportSVG,
    isExporting,
    windowRange,
  } = useInteractiveChart();

  const modeIcons: Record<ChartMode, React.ReactNode> = {
    trend: <TrendingUp className="h-4 w-4" />,
    comparison: <BarChart3 className="h-4 w-4" />,
    ranking: <ArrowRightLeft className="h-4 w-4" />,
  };

  return (
    <div className="flex items-center gap-1">
      {/* Zoom Controls */}
      <Button variant="outline" size="sm" onClick={zoomIn} title="放大">
        <span className="text-base">🔍+</span>
      </Button>
      <Button variant="outline" size="sm" onClick={zoomOut} title="縮小">
        <span className="text-base">🔍-</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={resetZoom}
        disabled={!windowRange}
        title="重置縮放"
      >
        <span className="text-base">↻</span>
      </Button>

      {/* Mode Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" title="圖表模式">
            {modeIcons[currentMode]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {(Object.keys(CHART_MODES) as ChartMode[]).map((mode) => (
            <DropdownMenuItem key={mode} onClick={() => onModeChange(mode)}>
              <span className="mr-2">{modeIcons[mode]}</span>
              {CHART_MODES[mode].label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Export Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isExporting}
            title="匯出"
          >
            <Download className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={exportPNG}>匯出 PNG</DropdownMenuItem>
          <DropdownMenuItem onClick={exportSVG}>匯出 SVG</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

//! =============== 5. 主組件 ===============

/**
 * 生產趨勢分析圖表
 * @param props.className - 外層 Card 樣式
 * @param props.chartOptions - useChartData 配置 (pollingInterval, maxDataPoints, enablePolling)
 */
export function ProductionTrendFeature({ className, chartOptions }: Props) {
  const { data, isLoading, isError, error, refetch } =
    useChartData(chartOptions);
  const [chartMode, setChartMode] = useState<ChartMode>("trend");

  const currentConfig = CHART_MODES[chartMode];

  //* Series 配置 - 使用工廠函式，避免在 useMemo 內部有複雜判斷
  const seriesConfigs = useMemo(
    () => getSeriesConfigs(chartMode, data.length),
    [chartMode, data.length]
  );

  //* Margin 配置
  const chartMargin = useMemo(
    () =>
      currentConfig.layout === "vertical"
        ? { top: 5, right: 30, left: 80, bottom: 5 }
        : { top: 5, right: 30, left: 20, bottom: 5 },
    [currentConfig.layout]
  );

  // Guard Clauses - 線性流程
  if (isLoading) return <ChartSkeleton />;
  if (isError) return <ChartError error={error} onRetry={refetch} />;
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-[350px] text-muted-foreground">
            目前沒有圖表資料
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="pt-4 pb-2">
        <InteractiveChart.Root
          data={data}
          xDataKey="time"
          enableZoom
          enablePan
          exportFilename="production-trend"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">生產趨勢分析</h3>
              <PerformanceBadge />
              <div className="text-xs text-muted-foreground flex items-center gap-3">
                <span>🖱️ 拖曳平移</span>
                <span className="text-muted-foreground/50">•</span>
                <span>🔘 按鈕縮放</span>
              </div>
            </div>
            <ChartControls
              currentMode={chartMode}
              onModeChange={setChartMode}
            />
          </div>

          {/* Canvas */}
          <InteractiveChart.Canvas
            layout={currentConfig.layout}
            height={380}
            leftAxisLabel="數量"
            rightAxisLabel="比例 (%)"
            margin={chartMargin}
            xAxisProps={{ minTickGap: 50 }}
          >
            {seriesConfigs.map((config) => (
              <InteractiveChart.Series key={config.dataKey} {...config} />
            ))}
          </InteractiveChart.Canvas>
        </InteractiveChart.Root>
      </CardContent>
    </Card>
  );
}
