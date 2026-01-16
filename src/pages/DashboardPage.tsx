/**
 * =====================================
 * 🎨 DashboardPage - 主儀表板頁面
 * =====================================
 * 整合所有 Mock Data 與組件的完整 UI 原型
 */

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
} from "@/mocks/data";

/**
 * DashboardPage 組件 - 主儀表板頁面
 *
 * @returns DashboardPage 元素
 *
 * 🧠 佈局設計:
 * - 全寬設計 (max-w-[1920px])，無 Sidebar
 * - Grid 系統: Top Metrics (5 欄) -> Main Content (7:3 黃金比例)
 * - 左側: Trend Chart + Equipment Table
 * - 右側: Watchlist Panel
 *
 * 💡 響應式策略:
 * - <768px: 單欄佈局
 * - 768-1024px: 2 欄佈局
 * - >1024px: 完整 Grid 佈局
 */
function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      {/* Main Container */}
      <main className="container mx-auto max-w-[1920px] px-4 py-6">
        {/* Top Metrics Cards - 5 欄佈局 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {mockStats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>

        {/* Main Content - 黃金比例 7:3 */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-7">
          {/* Left Column - Trend Chart + Equipment Table */}
          <div className="space-y-4 lg:col-span-4">
            <TrendChart data={mockChartData} />
            <EquipmentTable equipments={mockEquipments} />
          </div>

          {/* Right Column - Watchlist Panel */}
          <div className="lg:col-span-3">
            <WatchlistPanel items={mockWatchlist} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
