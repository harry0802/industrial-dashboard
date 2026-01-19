import { useState, useMemo } from "react";
import {
  InteractiveChart,
  useInteractiveChart,
  type LayoutDirection,
  type ChartType,
} from "@/components/charts/InteractiveChart";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, TrendingUp, BarChart3, ArrowRightLeft } from "lucide-react";

// 💡 業務資料型別
interface ProductionDataPoint {
  [key: string]: string | number;
  time: string;
  production: number;
  yield: number;
  efficiency: number;
  defectCount: number;
}

interface Props {
  data: ProductionDataPoint[];
  className?: string;
}

// 🧠 圖表模式定義 (Policy Layer)
type ChartMode = "trend" | "comparison" | "ranking";

interface ChartConfig {
  mode: ChartMode;
  layout: LayoutDirection;
  primaryType: ChartType;
  label: string;
}

const CHART_MODES: Record<ChartMode, ChartConfig> = {
  trend: {
    mode: "trend",
    layout: "horizontal",
    primaryType: "area",
    label: "趨勢檢視 (Area)",
  },
  comparison: {
    mode: "comparison",
    layout: "horizontal",
    primaryType: "bar",
    label: "產量比較 (Bar)",
  },
  ranking: {
    mode: "ranking",
    layout: "vertical",
    primaryType: "bar",
    label: "良率排名 (Horizontal Bar)",
  },
} as const;

// 🔥 Control Toolbar (使用 Render Props 取得圖表能力)
function ChartControls({
  currentMode,
  onModeChange,
}: {
  currentMode: ChartMode;
  onModeChange: (mode: ChartMode) => void;
}) {
  // 💡 透過 Hook 取得圖表能力
  const {
    zoomIn,
    zoomOut,
    resetZoom,
    exportPNG,
    exportSVG,
    isExporting,
    windowRange,
  } = useInteractiveChart();

  return (
    <div className="flex items-center gap-1">
      {/* 🔍 Zoom Controls */}
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

      {/* 🔥 Smart Dropdown: 複合狀態控制 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" title="圖表模式">
            {currentMode === "trend" && <TrendingUp className="h-4 w-4" />}
            {currentMode === "comparison" && <BarChart3 className="h-4 w-4" />}
            {currentMode === "ranking" && (
              <ArrowRightLeft className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onModeChange("trend")}>
            <TrendingUp className="mr-2 h-4 w-4" />
            {CHART_MODES.trend.label}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onModeChange("comparison")}>
            <BarChart3 className="mr-2 h-4 w-4" />
            {CHART_MODES.comparison.label}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onModeChange("ranking")}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            {CHART_MODES.ranking.label}
          </DropdownMenuItem>
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

// 🏭 Main Feature Component
export function ProductionTrendFeature({ data, className }: Props) {
  // 💡 複合狀態：同時控制 layout 和 type
  const [chartMode, setChartMode] = useState<ChartMode>("trend");

  const currentConfig = CHART_MODES[chartMode];

  // 🧠 Series 配置 (根據模式動態調整)
  const seriesConfigs = useMemo(() => {
    const baseType = currentConfig.primaryType;
    const isBarMode = baseType === "bar";

    // 🧠 良率排名模式：只顯示產量和不良品
    if (chartMode === "ranking") {
      return [
        {
          dataKey: "production",
          type: baseType,
          color: "#3b82f6",
          name: "產量",
          yAxisId: "left" as const,
          barSize: Math.max(10, Math.min(40, 300 / data.length)), // 🔥 動態柱寬
        },
        {
          dataKey: "defectCount",
          type: baseType,
          color: "#ef4444",
          name: "不良品",
          yAxisId: "left" as const,
          barSize: Math.max(10, Math.min(40, 300 / data.length)), // 🔥 動態柱寬
        },
      ];
    }

    // 🧠 產量比較模式：所有指標都用 Bar
    if (chartMode === "comparison") {
      return [
        {
          dataKey: "production",
          type: baseType,
          color: "#3b82f6",
          name: "產量",
          yAxisId: "left" as const,
          stackId: isBarMode ? "stack1" : undefined,
        },
        {
          dataKey: "defectCount",
          type: baseType,
          color: "#ef4444",
          name: "不良品",
          yAxisId: "left" as const,
          stackId: isBarMode ? "stack1" : undefined,
        },
        {
          dataKey: "yield",
          type: baseType,
          color: "#10b981",
          name: "良率 (%)",
          yAxisId: "right" as const,
        },
        {
          dataKey: "efficiency",
          type: baseType,
          color: "#8b5cf6",
          name: "稼動率 (%)",
          yAxisId: "right" as const,
        },
      ];
    }

    // 🧠 趨勢檢視模式：產量用 Area，其他用 Line
    return [
      {
        dataKey: "production",
        type: baseType,
        color: "#3b82f6",
        name: "產量",
        yAxisId: "left" as const,
        fillOpacity: baseType === "area" ? 0.3 : undefined,
      },
      {
        dataKey: "defectCount",
        type: "line" as const,
        color: "#ef4444",
        name: "不良品",
        yAxisId: "left" as const,
        strokeWidth: 2,
      },
      {
        dataKey: "yield",
        type: "line" as const,
        color: "#10b981",
        name: "良率 (%)",
        yAxisId: "right" as const,
        strokeWidth: 2,
      },
      {
        dataKey: "efficiency",
        type: "line" as const,
        color: "#8b5cf6",
        name: "稼動率 (%)",
        yAxisId: "right" as const,
        strokeWidth: 2,
        strokeDasharray: "5 5",
      },
    ];
  }, [currentConfig, chartMode, data.length]);

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        {/* 包裝在 Root 中以提供 Context */}
        <InteractiveChart.Root
          data={data}
          enableZoom
          enablePan
          exportFilename="production-trend"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">生產趨勢分析</h3>
              <div className="text-xs text-muted-foreground flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="text-base">🖱️</span>
                  <span>拖曳平移</span>
                </span>
                <span className="text-muted-foreground/50">•</span>
                <span className="flex items-center gap-1">
                  <span className="text-base">🔘</span>
                  <span>按鈕縮放</span>
                </span>
              </div>
            </div>

            {/* 🔥 Control Toolbar (在 Root 內部才能使用 Hook) */}
            <ChartControls
              currentMode={chartMode}
              onModeChange={setChartMode}
            />
          </div>

          {/* 🎨 Canvas: Layout 由外部控制 */}
          <InteractiveChart.Canvas
            layout={currentConfig.layout}
            height={350}
            leftAxisLabel="數量"
            rightAxisLabel="比例 (%)"
            margin={
              currentConfig.layout === "vertical"
                ? { top: 5, right: 30, left: 80, bottom: 5 } // 🔥 垂直模式增加左邊距
                : { top: 5, right: 30, left: 20, bottom: 5 }
            }
          >
            {/* 🔥 動態渲染 Series */}
            {seriesConfigs.map((config) => (
              <InteractiveChart.Series key={config.dataKey} {...config} />
            ))}
          </InteractiveChart.Canvas>
        </InteractiveChart.Root>
      </CardContent>
    </Card>
  );
}
