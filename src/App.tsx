/**
 * =====================================
 * 🏭 Industrial Dashboard - 主應用
 * =====================================
 * 工業營運儀表板主入口
 * 當前模式: UI Prototype (Mock Data)
 */

import DashboardPage from "@/pages/DashboardPage";
import PerformanceMonitor from "@/components/performance/PerformanceMonitor";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "@/components/layout/ErrorFallback";

/**
 * App 組件 - 主應用入口
 *
 * @returns {JSX.Element} App 元素
 *
 * 🧠 架構設計:
 * - DashboardPage: 完整的全寬 Dashboard UI (使用 Mock Data)
 * - ErrorBoundary: 頂層錯誤捕獲
 * - PerformanceMonitor: 固定定位的效能監控浮動面板
 *
 * 💡 開發階段:
 * - Phase 1.5: UI Prototype with Mock Data
 * - 專注於視覺效果與佈局完善
 * - 不進行任何 API 請求
 */
function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <DashboardPage />

      {/* 效能監控面板 - 固定在右下角 */}
      <PerformanceMonitor />
    </ErrorBoundary>
  );
}

export default App;
