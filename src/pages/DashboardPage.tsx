import React, { useMemo } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import TrendChart from "@/components/dashboard/TrendChart";
import EquipmentTable from "@/components/dashboard/EquipmentTable";
import WatchlistPanel from "@/components/dashboard/WatchlistPanel";
import {
  mockStats,
  mockChartData,
  mockEquipments,
  mockWatchlist,
  type StatMetric,
  type ChartDataPoint,
  type Equipment,
  type WatchlistItem,
} from "@/mocks/data";

//! =============== 1. 設定與常量 ===============

//* 定義佈局樣式常量，保持 JSX 整潔
const LAYOUT_STYLES = {
  CONTAINER: "container mx-auto max-w-[1920px] px-4 py-6",
  METRICS_GRID: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5",
  MAIN_CONTENT_GRID: "mt-6 grid grid-cols-1 gap-4 lg:grid-cols-4",
  LEFT_COLUMN: "space-y-4 lg:col-span-3",
  RIGHT_COLUMN: "lg:col-span-1",
} as const;

//! =============== 2. 類型與介面定義 ===============

/**
 * 儀表板資料介面
 * @interface DashboardData
 */
interface DashboardData {
  stats: StatMetric[];
  chartData: ChartDataPoint[];
  equipments: Equipment[];
  watchlist: WatchlistItem[];
}

/**
 * MetricsGrid Props
 * @interface MetricsGridProps
 */
interface MetricsGridProps {
  stats: StatMetric[];
}

//! =============== 3. 核心功能實作 (Hook) ===============

/**
 * 儀表板資料 Hook
 * @description 集中管理資料獲取邏輯，未來可在此替換為真實 API 呼叫 (React Query / SWR)
 * @returns {DashboardData} 儀表板所需的各項資料
 */
function useDashboardData(): DashboardData {
  // 模擬資料獲取 (在真實場景中，這裡會是 useQuery)
  const data = useMemo(
    () => ({
      stats: mockStats,
      chartData: mockChartData,
      equipments: mockEquipments,
      watchlist: mockWatchlist,
    }),
    []
  );

  return data;
}

//! =============== 4. 組件實作 (Sub-Components & Main) ===============

/**
 * 指標網格組件 (Sub-Component)
 * @description 實現 Push Fors Down 原則，將迴圈邏輯封裝在此
 * @performance 使用 React.memo 避免資料未變動時的重繪
 */
const MetricsGrid = React.memo(function MetricsGrid({
  stats,
}: MetricsGridProps) {
  return (
    <div className={LAYOUT_STYLES.METRICS_GRID}>
      {stats.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
});

MetricsGrid.displayName = "DashboardPage.MetricsGrid";

/**
 * DashboardPage 組件 - 主儀表板頁面
 * @component
 * @returns DashboardPage 元素
 *
 * 🧠 架構設計:
 * - Header: 固定頂部導航
 * - MetricsGrid: 頂部關鍵指標 (5欄)
 * - MainContent: 左右分欄佈局 (Trend + Table vs Watchlist)
 */
function DashboardPage() {
  // 1. 使用 Custom Hook 獲取資料
  const { stats, chartData, equipments, watchlist } = useDashboardData();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      {/* Main Container */}
      <main className={LAYOUT_STYLES.CONTAINER}>
        {/* Top Metrics Section */}
        <section aria-label="Key Performance Indicators">
          <MetricsGrid stats={stats} />
        </section>

        {/* Main Content Layout */}
        <div className={LAYOUT_STYLES.MAIN_CONTENT_GRID}>
          {/* Left Column: Charts & Data Tables */}
          <div className={LAYOUT_STYLES.LEFT_COLUMN}>
            <TrendChart data={chartData} />
            <EquipmentTable equipments={equipments} />
          </div>

          {/* Right Column: Sidebar Panels */}
          <div className={LAYOUT_STYLES.RIGHT_COLUMN}>
            <WatchlistPanel items={watchlist} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
