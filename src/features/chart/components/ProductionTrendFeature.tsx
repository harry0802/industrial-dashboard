/**
 * Production Trend Feature
 *
 * - 整合真實 API (24h 歷史 + 5 分鐘即時更新)
 * - 使用 ZoomableChart 實現縮放功能
 * - 三種圖表模式：Line / Area / Bar
 * - 雙 Y 軸策略：左軸 (產量)，右軸 (小數值 + 百分比)
 */

import { useState, useMemo, useCallback, useRef } from "react";
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
import { Download, RefreshCw, AlertCircle } from "lucide-react";
import { ZoomableChart, type SeriesConfig } from "@/components/charts/ZoomableChart";
import { useChartData, type UseChartDataOptions } from "../hooks/useChartData";
import { cn } from "@/lib/utils";
import { toPng, toSvg } from "html-to-image";

//! =============== 型別定義 ===============

interface Props {
  className?: string;
  chartOptions?: UseChartDataOptions;
}

type ChartMode = "line" | "area" | "bar";

//! =============== 常量配置 ===============

const CHART_MODES: Record<ChartMode, string> = {
  line: "Line Chart",
  area: "Area Chart",
  bar: "Bar Chart",
};

//* Series 顏色與 Y 軸映射
const SERIES_CONFIG = {
  production: { color: "#3b82f6", name: "產量 (pcs)", yAxisId: "left" as const },
  defectCount: { color: "#ef4444", name: "不良品 (pcs)", yAxisId: "right" as const },
  downtime: { color: "#f59e0b", name: "停機 (次)", yAxisId: "right" as const },
  yield: { color: "#10b981", name: "良率 (%)", yAxisId: "right" as const },
  efficiency: { color: "#8b5cf6", name: "稼動率 (%)", yAxisId: "right" as const },
} as const;

//* Series 渲染順序 (後面的在上層)
const SERIES_ORDER = ["production", "downtime", "defectCount", "efficiency", "yield"] as const;

//! =============== 純函數 ===============

function buildSeriesConfig(chartMode: ChartMode): SeriesConfig[] {
  return SERIES_ORDER.map((key) => ({
    dataKey: key,
    type: chartMode,
    color: SERIES_CONFIG[key].color,
    name: SERIES_CONFIG[key].name,
    yAxisId: SERIES_CONFIG[key].yAxisId,
    fillOpacity: chartMode === "area" ? getFillOpacity(key) : 0.9,
    strokeWidth: 2,
  }));
}

function getFillOpacity(key: string): number {
  const opacityMap: Record<string, number> = {
    production: 0.4,
    downtime: 0.35,
    defectCount: 0.3,
    efficiency: 0.25,
    yield: 0.2,
  };
  return opacityMap[key] ?? 0.3;
}

//! =============== 子組件 ===============

function ChartSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        <Skeleton className="h-[420px] w-full" />
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
        <div className="flex flex-col items-center justify-center h-[420px] gap-4">
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

//! =============== 主組件 ===============

export function ProductionTrendFeature({ className, chartOptions }: Props) {
  const { data, isLoading, isError, error, refetch } = useChartData(chartOptions);
  const [chartMode, setChartMode] = useState<ChartMode>("area");
  const [isExporting, setIsExporting] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  //* 根據模式動態生成 Series 配置
  const seriesConfig = useMemo(() => buildSeriesConfig(chartMode), [chartMode]);

  //* X 軸時間格式化
  const formatXAxis = useCallback((value: string) => {
    // 假設 value 是 "HH:mm" 格式，保持原樣
    return value;
  }, []);

  //* 匯出功能
  const handleExportPNG = useCallback(async () => {
    if (!chartContainerRef.current) return;

    setIsExporting(true);
    try {
      const dataUrl = await toPng(chartContainerRef.current, {
        backgroundColor: "white",
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = `production-trend-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export PNG failed:", err);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handleExportSVG = useCallback(async () => {
    if (!chartContainerRef.current) return;

    setIsExporting(true);
    try {
      const dataUrl = await toSvg(chartContainerRef.current);

      const link = document.createElement("a");
      link.download = `production-trend-${Date.now()}.svg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export SVG failed:", err);
    } finally {
      setIsExporting(false);
    }
  }, []);

  // Guard Clauses
  if (isLoading) return <ChartSkeleton />;
  if (isError) return <ChartError error={error} onRetry={refetch} />;
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-[420px] text-muted-foreground">
            目前沒有圖表資料
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="pt-4 pb-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">生產趨勢分析</h3>

          <div className="flex items-center gap-2">
            {/* Chart Type Select */}
            <Select
              value={chartMode}
              onValueChange={(v) => setChartMode(v as ChartMode)}
            >
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(CHART_MODES) as ChartMode[]).map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {CHART_MODES[mode]}
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
                <DropdownMenuItem onClick={handleExportPNG}>匯出 PNG</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportSVG}>匯出 SVG</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Chart */}
        <div ref={chartContainerRef}>
          <ZoomableChart
            data={data}
            xDataKey="time"
            series={seriesConfig}
            height={380}
            showBrush
            showResetButton
            dualYAxis={{
              leftLabel: "產量",
              rightLabel: "數值 / %",
            }}
            xAxisFormatter={formatXAxis}
          />
        </div>
      </CardContent>
    </Card>
  );
}
