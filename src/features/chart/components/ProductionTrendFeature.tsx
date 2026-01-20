/**
 * Production Trend Feature
 * - 整合真實 API (24h 歷史 + 5 分鐘即時更新)
 * - 支援 Zoom/Pan/Export
 * - 三種圖表模式：Line / Area / Bar (全部垂直佈局)
 * - 雙 Y 軸策略：左軸 (產量)，右軸 (小數值 + 百分比)
 */

import { useState, useMemo } from "react";
import {
  InteractiveChart,
  useInteractiveChart,
} from "@/components/charts/InteractiveChart";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useChartData, type UseChartDataOptions } from "../hooks/useChartData";
import { cn } from "@/lib/utils";

//! =============== 1. 型別定義 ===============

interface Props {
  className?: string;
  chartOptions?: UseChartDataOptions;
}

type ChartMode = "line" | "area" | "bar";

interface ChartModeConfig {
  label: string;
  description: string;
}

interface SeriesConfig {
  dataKey: string;
  type: "line" | "area" | "bar";
  color: string;
  name: string;
  yAxisId: "left" | "right";
  fillOpacity?: number;
  strokeWidth?: number;
}

//! =============== 2. 常量配置 ===============

const CHART_MODES: Record<ChartMode, ChartModeConfig> = {
  line: {
    label: "Line Chart",
    description: "折線圖",
  },
  area: {
    label: "Area Chart",
    description: "面積圖",
  },
  bar: {
    label: "Bar Chart",
    description: "垂直長條圖",
  },
} as const;

//* 統一的 Series 顏色配置
const SERIES_COLORS = {
  production: "#3b82f6", // Blue - 產量 (左軸)
  defectCount: "#ef4444", // Red - 不良品 (右軸)
  downtime: "#f59e0b", // Amber - 停機次數 (右軸)
  yield: "#10b981", // Green - 良率 (右軸)
  efficiency: "#8b5cf6", // Purple - 稼動率 (右軸)
} as const;

//* 雙 Y 軸策略：
//* - 左軸 (left): production (~800) - 大數值
//* - 右軸 (right): defectCount (~15), downtime (~5), yield (~98%), efficiency (~85%) - 小數值/百分比
const SERIES_Y_AXIS_MAPPING: Record<string, "left" | "right"> = {
  production: "left",
  defectCount: "right",
  downtime: "right",
  yield: "right",
  efficiency: "right",
};

//! =============== 3. Series 配置工廠 ===============

function buildSeriesConfigs(mode: ChartMode): SeriesConfig[] {
  const baseConfigs = [
    {
      dataKey: "production",
      color: SERIES_COLORS.production,
      name: "產量 (pcs)",
      yAxisId: SERIES_Y_AXIS_MAPPING.production,
    },
    {
      dataKey: "defectCount",
      color: SERIES_COLORS.defectCount,
      name: "不良品 (pcs)",
      yAxisId: SERIES_Y_AXIS_MAPPING.defectCount,
    },
    {
      dataKey: "downtime",
      color: SERIES_COLORS.downtime,
      name: "停機 (次)",
      yAxisId: SERIES_Y_AXIS_MAPPING.downtime,
    },
    {
      dataKey: "yield",
      color: SERIES_COLORS.yield,
      name: "良率 (%)",
      yAxisId: SERIES_Y_AXIS_MAPPING.yield,
    },
    {
      dataKey: "efficiency",
      color: SERIES_COLORS.efficiency,
      name: "稼動率 (%)",
      yAxisId: SERIES_Y_AXIS_MAPPING.efficiency,
    },
  ] as const;

  return baseConfigs.map((config) => ({
    ...config,
    type: mode,
    strokeWidth: mode === "line" || mode === "area" ? 2 : undefined,
    fillOpacity: mode === "area" ? getFillOpacity(config.dataKey) : undefined,
  }));
}

//* Area 模式的填充透明度 (讓層次分明)
function getFillOpacity(dataKey: string): number {
  const opacityMap: Record<string, number> = {
    production: 0.4,
    defectCount: 0.35,
    downtime: 0.3,
    yield: 0.25,
    efficiency: 0.2,
  };
  return opacityMap[dataKey] ?? 0.3;
}

//! =============== 4. 子組件 ===============

function ChartSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
        <Skeleton className="h-[380px] w-full" />
      </CardContent>
    </Card>
  );
}

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
        <div className="flex flex-col items-center justify-center h-[380px] gap-4">
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

function ChartControls({
  currentMode,
  onModeChange,
}: {
  currentMode: ChartMode;
  onModeChange: (mode: ChartMode) => void;
}) {
  const { zoomIn, zoomOut, resetZoom, exportPNG, exportSVG, isExporting, windowRange } =
    useInteractiveChart();

  return (
    <div className="flex items-center gap-2">
      {/* Zoom Controls - Icon Buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={zoomIn}
          title="放大"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={zoomOut}
          title="縮小"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={resetZoom}
          disabled={!windowRange}
          title="重置縮放"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Chart Type Select */}
      <Select value={currentMode} onValueChange={(v) => onModeChange(v as ChartMode)}>
        <SelectTrigger className="w-[140px] h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(CHART_MODES) as ChartMode[]).map((mode) => (
            <SelectItem key={mode} value={mode}>
              {CHART_MODES[mode].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Export Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
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

export function ProductionTrendFeature({ className, chartOptions }: Props) {
  const { data, isLoading, isError, error, refetch } = useChartData(chartOptions);
  const [chartMode, setChartMode] = useState<ChartMode>("area");

  //* 根據模式動態生成 Series 配置
  const seriesConfigs = useMemo(
    () => buildSeriesConfigs(chartMode),
    [chartMode]
  );

  //* 固定 margin (全部垂直佈局，X 軸在底部)
  const chartMargin = useMemo(
    () => ({ top: 5, right: 30, left: 20, bottom: 5 }),
    []
  );

  // Guard Clauses
  if (isLoading) return <ChartSkeleton />;
  if (isError) return <ChartError error={error} onRetry={refetch} />;
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-[380px] text-muted-foreground">
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">生產趨勢分析</h3>
            <ChartControls currentMode={chartMode} onModeChange={setChartMode} />
          </div>

          {/* Canvas - 全部使用 horizontal layout (垂直圖表) */}
          <InteractiveChart.Canvas
            layout="horizontal"
            height={380}
            leftAxisLabel="產量"
            rightAxisLabel="數值 / %"
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
