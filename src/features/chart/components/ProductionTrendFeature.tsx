/**
 * Production Trend Feature
 *
 * 使用 Chart Compound Components 重構
 * - IoC: Reset 按鈕放在 Header
 * - 三種圖表模式：Line / Area / Bar
 * - 雙 Y 軸策略：左軸 (產量)，右軸 (小數值 + 百分比)
 */

import { useState, useMemo, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
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

const CHART_MODE_KEYS: ChartMode[] = ["line", "area", "bar"];

const CHART_COLORS: Record<string, string> = {
  production: "#3b82f6",
  defectCount: "#ef4444",
  downtime: "#f59e0b",
  yield: "#10b981",
  efficiency: "#8b5cf6",
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
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center h-[420px] gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center">
            <p className="font-medium">{t("chart.messages.loadError")}</p>
            <p className="text-sm text-muted-foreground">
              {error?.message || t("chart.messages.unknownError")}
            </p>
          </div>
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("common.retry")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

//! =============== 主組件 ===============

export function ProductionTrendFeature({ className, chartOptions }: Props) {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const { data, isLoading, isError, error, refetch } =
    useChartData(chartOptions);
  const [chartMode, setChartMode] = useState<ChartMode>("area");
  const [isExporting, setIsExporting] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  //* 動態產生 ChartConfig (i18n)
  const chartConfig = useMemo<ChartConfig>(
    () => ({
      production: { label: t("chart.series.production"), color: CHART_COLORS.production },
      defectCount: { label: t("chart.series.defectCount"), color: CHART_COLORS.defectCount },
      downtime: { label: t("chart.series.downtime"), color: CHART_COLORS.downtime },
      yield: { label: t("chart.series.yield"), color: CHART_COLORS.yield },
      efficiency: { label: t("chart.series.efficiency"), color: CHART_COLORS.efficiency },
    }),
    [t]
  );

  //* X 軸時間格式化
  const formatXAxis = useCallback((value: string) => value, []);

  //* 匯出功能 - Theme-aware 背景色
  const exportBackgroundColor = resolvedTheme === "dark" ? "#020817" : "#ffffff";

  const handleExportPNG = useCallback(async () => {
    if (!chartContainerRef.current) return;

    setIsExporting(true);
    try {
      const dataUrl = await toPng(chartContainerRef.current, {
        backgroundColor: exportBackgroundColor,
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
  }, [exportBackgroundColor]);

  const handleExportSVG = useCallback(async () => {
    if (!chartContainerRef.current) return;

    setIsExporting(true);
    try {
      const dataUrl = await toSvg(chartContainerRef.current, {
        backgroundColor: exportBackgroundColor,
      });

      const link = document.createElement("a");
      link.download = `production-trend-${Date.now()}.svg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export SVG failed:", err);
    } finally {
      setIsExporting(false);
    }
  }, [exportBackgroundColor]);

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
            {t("chart.messages.noData")}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Chart.Root data={data} config={chartConfig} xDataKey="time">
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="pt-4 pb-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">{t("chart.messages.analysisTitle")}</h3>

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
                  {CHART_MODE_KEYS.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {t(`chart.modes.${mode}`)}
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
                    title={t("chart.actions.export")}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportPNG}>
                    {t("chart.actions.exportPng")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportSVG}>
                    {t("chart.actions.exportSvg")}
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
