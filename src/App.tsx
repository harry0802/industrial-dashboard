/**
 * =====================================
 * 🏭 Industrial Dashboard - 主應用
 * =====================================
 * 工業營運儀表板主入口
 * Phase 1: 基礎建設 & 效能監控
 */

import AppLayout from "@/components/layout/AppLayout";
import PerformanceMonitor from "@/components/performance/PerformanceMonitor";
import APITester from "@/components/APITester";
import { PageHeader } from "@/components/ui/page-header";

/**
 * App 組件 - 主應用入口
 *
 * @returns {JSX.Element} App 元素
 *
 * 🧠 架構設計:
 * - AppLayout: 提供 Header + ErrorBoundary 包裝
 * - PageHeader: 統一的頁面標題組件 (shadcn 語義組件)
 * - APITester: Phase 1 開發用的 API 測試工具
 * - PerformanceMonitor: 固定定位的效能監控浮動面板
 */
function App() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Industrial Dashboard"
          description="Phase 1: 基礎建設 & 效能監控"
        />

        <APITester />
      </div>

      {/* 效能監控面板 - 固定在右下角 */}
      <PerformanceMonitor />
    </AppLayout>
  );
}

export default App;
