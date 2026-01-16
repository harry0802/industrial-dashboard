/**
 * =====================================
 * 📈 TrendChart - 產能趨勢圖表
 * =====================================
 * 使用 Recharts 顯示 24 小時趨勢資料
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ChartDataPoint } from "@/mocks/data";
import { useMemo } from "react";

/**
 * @typedef {Object} TrendChartProps
 * @property {ChartDataPoint[]} data - 圖表資料點陣列
 */
interface TrendChartProps {
  data: ChartDataPoint[];
}

/**
 * TrendChart 組件 - 產能趨勢圖表
 *
 * @param props - 組件屬性
 * @param props.data - 24 小時趨勢資料
 * @returns TrendChart 元素
 *
 * 🧠 效能優化:
 * - 使用 useMemo 穩定 Recharts Props (避免重複渲染)
 * - ResponsiveContainer 配合 debounce (參考 CLAUDE.md 規範)
 *
 * 💡 視覺設計:
 * - 使用 AreaChart 呈現趨勢填充效果
 * - 3 條曲線: Production (藍), Yield (綠), Efficiency (紫)
 */
function TrendChart({ data }: TrendChartProps) {
  // 💡 Props Stability: 穩定物件引用避免 Recharts 重複渲染
  const chartConfig = useMemo(
    () => ({
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    }),
    []
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Production Trend (24h)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350} debounce={300}>
          <AreaChart data={data} margin={chartConfig.margin}>
            <defs>
              <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="time"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="production"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorProduction)"
              name="Production"
            />
            <Area
              type="monotone"
              dataKey="yield"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorYield)"
              name="Yield %"
            />
            <Area
              type="monotone"
              dataKey="efficiency"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#colorEfficiency)"
              name="Efficiency %"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default TrendChart;
