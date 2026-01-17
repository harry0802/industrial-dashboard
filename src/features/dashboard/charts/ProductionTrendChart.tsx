import TrendChart from "@/components/TrendChart";
import type { ChartDataPoint } from "@/mocks/data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ProductionTrendChartProps {
  data: ChartDataPoint[];
  className?: string;
}

/**
 * 🏭 ProductionTrendChart - Dashboard 專用的生產趨勢圖表
 *
 * 使用 Compound Components Pattern：
 * - ✨ 完全解耦：按鈕和下拉選單可由外部決定
 * - 🎨 靈活組合：像樂高一樣自由組合
 * - 🔧 易於擴展：新增功能不用改底層組件
 *
 * 優勢:
 * - Dashboard Feature 決定要顯示哪些控制元件
 * - 可以自由調整佈局和樣式
 * - 未來可以輕鬆新增更多功能 (如分享、全螢幕等)
 */
export function ProductionTrendChart({
  data,
  className,
}: ProductionTrendChartProps) {
  return (
    <TrendChart.Root data={data} defaultChartType="area">
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Production Trend</CardTitle>

          {/* 🎯 外部決定要哪些控制元件！完全解耦 */}
          <div className="flex items-center gap-1">
            <TrendChart.ResetButton />
            <TrendChart.TypeSelector />
            <TrendChart.ExportMenu />
          </div>
        </CardHeader>

        <CardContent>
          <TrendChart.Canvas enableZoom enablePan />
        </CardContent>
      </Card>
    </TrendChart.Root>
  );
}
