import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { StatMetric } from "@/mocks/data";
import { getColorClasses } from "@/mocks/data";

//! =============== 1. 設定與常量 ===============

//* 定義趨勢對應的圖示配置，消除邏輯判斷
const TREND_ICONS: Record<string, LucideIcon> = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
} as const;

//* 預設圖示，用於未知的趨勢類型
const DEFAULT_ICON = Minus;

//! =============== 2. 類型與介面定義 ===============

/**
 * 統計卡片 Props
 * @typedef {Object} StatCardProps
 * @property {StatMetric} stat - 統計指標資料物件
 * @property {string} [className] - 可選的額外樣式
 */
interface StatCardProps {
  stat: StatMetric;
  className?: string;
}

/**
 * Hook 返回介面
 * @typedef {Object} UseStatCardReturn
 * @property {LucideIcon} TrendIcon - 計算後的趨勢圖示組件
 * @property {Object} colors - 計算後的顏色樣式
 */
interface UseStatCardReturn {
  TrendIcon: LucideIcon;
  colors: {
    bg: string;
    text: string;
    border?: string;
    icon?: string;
  };
}

//! =============== 3. 核心功能實作 (Hook) ===============

/**
 * 統計卡片邏輯 Hook
 * @description 封裝樣式計算與圖示選擇邏輯
 * @param {StatMetric} stat - 統計資料
 * @returns {UseStatCardReturn} 處理後的視圖資料
 */
function useStatCardLogic(stat: StatMetric): UseStatCardReturn {
  //* 1. 解析圖示: 使用查表法替代 if/else 或 switch
  const TrendIcon = useMemo(() => {
    return TREND_ICONS[stat.trend] || DEFAULT_ICON;
  }, [stat.trend]);

  //* 2. 解析顏色: 呼叫 helper 函數
  const colors = useMemo(() => {
    return getColorClasses(stat.color);
  }, [stat.color]);

  return {
    TrendIcon,
    colors,
  };
}

//! =============== 4. 組件實作 (Component) ===============

/**
 * KPI 統計卡片組件 (StatCard)
 * @component
 * @description 顯示單一 KPI 指標，包含數值、變化趨勢、圖示
 * @performance 使用 React.memo 避免不必要的重繪
 */
const StatCard = React.memo(function StatCard({
  stat,
  className,
}: StatCardProps) {
  // 1. 使用 Custom Hook 獲取邏輯
  const { TrendIcon, colors } = useStatCardLogic(stat);

  return (
    <Card
      className={`from-primary/5 bg-linear-to-t to-card p-4 rounded-lg focus:outline-none ${
        className || ""
      }`}
    >
      <CardContent>
        <div className="flex items-start justify-between ">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>

          {/* 圖示區塊 */}
          <div className={`rounded-full p-2 ${colors.bg}`}>
            <TrendIcon className={`h-4 w-4 ${colors.text}`} />
          </div>
        </div>

        {/* 趨勢文字區塊 */}
        <div className="mt-3 flex items-center gap-1 text-sm">
          <span className={colors.text}>{stat.change}</span>
          <span className="text-muted-foreground">from last period</span>
        </div>
      </CardContent>
    </Card>
  );
});

// 設定顯示名稱
StatCard.displayName = "StatCard";

export default StatCard;
