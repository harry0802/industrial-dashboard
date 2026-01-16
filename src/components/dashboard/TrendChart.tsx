import React, { useMemo } from "react";
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

//! =============== 1. 設定與常量 ===============

//* 定義圖表外觀常量，避免在渲染週期中重複創建
const CHART_CONSTANTS = {
  HEIGHT: 350,
  DEBOUNCE: 300,
  COLORS: {
    PRODUCTION: "#3b82f6",
    YIELD: "#10b981",
    EFFICIENCY: "#8b5cf6",
  },
} as const;

//* 定義漸層 ID，確保唯一性
const GRADIENT_IDS = {
  PRODUCTION: "colorProduction",
  YIELD: "colorYield",
  EFFICIENCY: "colorEfficiency",
} as const;

//! =============== 2. 類型與介面定義 ===============

/**
 * 圖表邊距設定類型
 * @typedef {Object} ChartMargin
 */
type ChartMargin = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

/**
 * 圖表組件 Props
 * @typedef {Object} TrendChartProps
 * @property {ChartDataPoint[]} data - 24 小時趨勢資料陣列
 * @property {string} [className] - 可選的額外樣式類名
 */
interface TrendChartProps {
  data: ChartDataPoint[];
  className?: string;
}

/**
 * Hook 返回介面
 * @interface UseTrendChartReturn
 */
interface UseTrendChartReturn {
  chartConfig: {
    margin: ChartMargin;
  };
  gradients: { id: string; color: string }[];
}

//! =============== 3. 核心功能實作 (Hook) ===============

/**
 * 圖表邏輯 Hook
 * @description 封裝圖表配置邏輯，遵循 Custom Hook 優先原則
 * * @returns {UseTrendChartReturn} 圖表配置與資料
 */
function useTrendChartLogic(): UseTrendChartReturn {
  //* 使用 useMemo 確保配置物件引用穩定，避免 Recharts 不必要的重計算
  const chartConfig = useMemo(
    () => ({
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    }),
    []
  );

  //* 定義漸層配置，方便遍歷渲染
  const gradients = useMemo(
    () => [
      { id: GRADIENT_IDS.PRODUCTION, color: CHART_CONSTANTS.COLORS.PRODUCTION },
      { id: GRADIENT_IDS.YIELD, color: CHART_CONSTANTS.COLORS.YIELD },
      { id: GRADIENT_IDS.EFFICIENCY, color: CHART_CONSTANTS.COLORS.EFFICIENCY },
    ],
    []
  );

  return {
    chartConfig,
    gradients,
  };
}

//! =============== 4. 組件實作 (Component) ===============

/**
 * 產能趨勢圖表組件 (TrendChart)
 * * @component
 * @description 顯示 24 小時內的生產、良率與效率趨勢
 * * @see {@link https://recharts.org/en-US/api/AreaChart Recharts AreaChart}
 * * @performance
 * - 使用 React.memo 包裝，避免父組件渲染導致重繪
 * - ResponsiveContainer 啟用 debounce 減少 Resize 計算開銷
 */
const TrendChart = React.memo(function TrendChart({
  data,
  className,
}: TrendChartProps) {
  // 1. 使用 Custom Hook 獲取邏輯配置
  const { chartConfig, gradients } = useTrendChartLogic();

  //? 如果沒有數據，是否需要顯示 Empty State?
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-[350px]">
          <span className="text-muted-foreground">No Data Available</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Production Trend (24h)</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 🧠 Heavy Component Optimization: 設定 debounce 以優化視窗縮放效能 */}
        <ResponsiveContainer
          width="100%"
          height={CHART_CONSTANTS.HEIGHT}
          debounce={CHART_CONSTANTS.DEBOUNCE}
        >
          <AreaChart data={data} margin={chartConfig.margin}>
            <defs>
              {gradients.map(({ id, color }) => (
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />

            <XAxis
              dataKey="time"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickMargin={10}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => `${value}`}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              itemStyle={{ padding: 0 }}
            />

            <Legend wrapperStyle={{ paddingTop: "20px" }} />

            <Area
              type="monotone"
              dataKey="production"
              stroke={CHART_CONSTANTS.COLORS.PRODUCTION}
              strokeWidth={2}
              fill={`url(#${GRADIENT_IDS.PRODUCTION})`}
              name="Production"
              animationDuration={1000}
            />
            <Area
              type="monotone"
              dataKey="yield"
              stroke={CHART_CONSTANTS.COLORS.YIELD}
              strokeWidth={2}
              fill={`url(#${GRADIENT_IDS.YIELD})`}
              name="Yield %"
              animationDuration={1000}
            />
            <Area
              type="monotone"
              dataKey="efficiency"
              stroke={CHART_CONSTANTS.COLORS.EFFICIENCY}
              strokeWidth={2}
              fill={`url(#${GRADIENT_IDS.EFFICIENCY})`}
              name="Efficiency %"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

// 設定顯示名稱以利於 DevTools 偵錯
TrendChart.displayName = "TrendChart";

export default TrendChart;
