import { useEffect, useRef } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { WatchlistPanel, PerformanceMonitor } from "./components";
import { ProductionTrendFeature } from "@/features/chart";
import { KPIMetricsFeature } from "@/features/kpi";
import { EquipmentFeature } from "@/features/equipment";
import { usePerformanceStore } from "@/stores/usePerformanceStore";

/**
 * 🎯 DashboardPage - 工業營運儀表板
 *
 * Feature-Sliced Design 架構
 * - KPIMetricsFeature: 頂部 KPI 指標 (獨立 Feature)
 * - ProductionTrendFeature: 趨勢圖表 (獨立 Feature)
 * - EquipmentFeature: 設備列表 (獨立 Feature)
 *
 * 架構設計:
 * - Header: 固定頂部導航
 * - KPIMetricsFeature: 頂部關鍵指標 (5欄)
 * - MainContent: 左右分欄佈局 (Charts + Tables vs Panels)
 */
// ⏱️ 頁面載入起始時間 (模組層級)
const pageLoadStart = performance.now();

function DashboardPage() {
  const recordMetric = usePerformanceStore((s) => s.recordMetric);
  const hasRecorded = useRef(false);

  // ⏱️ Performance Metric: Total Page Render Time
  useEffect(() => {
    if (hasRecorded.current) return;
    hasRecorded.current = true;

    requestAnimationFrame(() => {
      const duration = performance.now() - pageLoadStart;
      recordMetric("Total Page Render Time", duration);
    });
  }, [recordMetric]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto max-w-[1920px] px-4 py-6">
        {/* Top Metrics Section */}
        <section aria-label="Key Performance Indicators">
          <KPIMetricsFeature />
        </section>

        {/* Trend Chart + Watchlist - 固定高度 480px */}
        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-4 h-[500px]">
            <ProductionTrendFeature className="h-full" />
          </div>
          <div className="lg:col-span-1 h-[500px]">
            <WatchlistPanel className="h-full" />
          </div>
        </section>

        {/* Equipment Table + Performance Monitor */}
        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-4">
            <EquipmentFeature />
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
