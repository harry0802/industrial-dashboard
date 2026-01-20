/**
 * Production Trend Feature
 *
 * 使用 Chart Compound Components 重構
 * - IoC: Reset 按鈕放在 Header
 * - 三種圖表模式：Line / Area / Bar
 * - 雙 Y 軸策略：左軸 (產量)，右軸 (小數值 + 百分比)
 */

import { useState, useMemo, useCallback, useRef } from "react";
import { XAxis, YAxis } from "recharts";
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
import { Chart, type ChartConfig } from "@/components/chart";
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

const CHART_CONFIG: ChartConfig = {
  production: { label: "產量 (pcs)", color: "#3b82f6" },
  defectCount: { label: "不良品 (pcs)", color: "#ef4444" },
  downtime: { label: "停機 (次)", color: "#f59e0b" },
  yield: { label: "良率 (%)", color: "#10b981" },
  efficiency: { label: "稼動率 (%)", color: "#8b5cf6" },
};

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
  const { data, isLoading, isError, error, refetch } =
    useChartData(chartOptions);
  const [chartMode, setChartMode] = useState<ChartMode>("area");
  const [isExporting, setIsExporting] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  //* X 軸時間格式化
  const formatXAxis = useCallback((value: string) => value, []);

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

  // X 軸配置 - memoized
  const xAxisConfig = useMemo(
    () => ({
      dataKey: "time",
      tickLine: false,
      axisLine: false,
      tickMargin: 10,
      minTickGap: 32,
      tickFormatter: formatXAxis,
      stroke: "hsl(var(--muted-foreground))",
      fontSize: 12,
    }),
    [formatXAxis],
  );

  // Y 軸配置 - memoized
  const yAxisBaseConfig = useMemo(
    () => ({
      tickLine: false,
      axisLine: false,
      tickMargin: 10,
      stroke: "hsl(var(--muted-foreground))",
      fontSize: 12,
    }),
    [],
  );

  // Guard Clauses
  if (isLoading) return <ChartSkeleton />;
  if (isError) return <ChartError error={error} onRetry={refetch} />;
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-[105px] text-muted-foreground">
            目前沒有圖表資料
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Chart.Root data={data} config={CHART_CONFIG} xDataKey="time">
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="pt-4 pb-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">生產趨勢分析</h3>

            <div className="flex items-center gap-2">
              {/* 🔥 IoC: Reset 按鈕現在可以自由放在 Header */}
              <Chart.ResetButton className="h-8 text-xs" />

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
                  <DropdownMenuItem onClick={handleExportPNG}>
                    匯出 PNG
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportSVG}>
                    匯出 SVG
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Chart */}
          <div ref={chartContainerRef}>
            <Chart.Canvas height={380}>
              {/* Axes - 使用原生 Recharts */}
              <XAxis {...xAxisConfig} />
              <YAxis yAxisId="left" {...yAxisBaseConfig} />
              <YAxis yAxisId="right" orientation="right" {...yAxisBaseConfig} />

              {/* Series - 順序決定渲染層級 (後面的在上層) */}
              <Chart.Series
                dataKey="production"
                type={chartMode}
                yAxisId="left"
                fillOpacity={chartMode === "area" ? 0.4 : 0.9}
              />
              <Chart.Series
                dataKey="downtime"
                type={chartMode}
                yAxisId="right"
                fillOpacity={chartMode === "area" ? 0.35 : 0.9}
              />
              <Chart.Series
                dataKey="defectCount"
                type={chartMode}
                yAxisId="right"
                fillOpacity={chartMode === "area" ? 0.3 : 0.9}
              />
              <Chart.Series
                dataKey="efficiency"
                type={chartMode}
                yAxisId="right"
                fillOpacity={chartMode === "area" ? 0.25 : 0.9}
              />
              <Chart.Series
                dataKey="yield"
                type={chartMode}
                yAxisId="right"
                fillOpacity={chartMode === "area" ? 0.2 : 0.9}
              />

              <Chart.Tooltip />
              <Chart.Legend enableToggle />
              <Chart.Brush previewDataKey="production" />
            </Chart.Canvas>
          </div>
        </CardContent>
      </Card>
    </Chart.Root>
  );
}
