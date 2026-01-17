import DashboardHeader from "@/components/layout/DashboardHeader";
import {
  MetricsGrid,
  EquipmentTable,
  WatchlistPanel,
  PerformanceMonitor,
} from "./components";
import { ProductionTrendChart } from "./charts";
import { useDashboardData } from "./hooks/useDashboardData";

/**
 * 🎯 DashboardPage - 工業營運儀表板
 *
 * Feature-Sliced Design 架構
 * - components/: Dashboard 專屬組件
 * - charts/: 圖表模組 (TrendChart)
 * - hooks/: 資料獲取邏輯
 *
 * 架構設計:
 * - Header: 固定頂部導航
 * - MetricsGrid: 頂部關鍵指標 (5欄)
 * - MainContent: 左右分欄佈局 (Charts + Tables vs Panels)
 */
function DashboardPage() {
  const { stats, chartData, equipments, watchlist } = useDashboardData();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto max-w-[1920px] px-4 py-6">
        {/* Top Metrics Section */}
        <section aria-label="Key Performance Indicators">
          <MetricsGrid stats={stats} />
        </section>

        {/* Trend Chart + Watchlist */}
        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5 min-h-112.5">
          <div className="space-y-4 lg:col-span-4">
            <ProductionTrendChart data={chartData} />
          </div>
          <div className="lg:col-span-1">
            <WatchlistPanel items={watchlist} />
          </div>
        </section>

        {/* Equipment Table + Performance Monitor */}
        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-4">
            <EquipmentTable equipments={equipments} />
          </div>
          <div className="lg:col-span-1">
            <PerformanceMonitor />
          </div>
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;
