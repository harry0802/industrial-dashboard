/**
 * =====================================
 * 🏗️ AppLayout - 應用主佈局
 * =====================================
 * 提供應用的統一佈局結構，包含 Header 和 ErrorBoundary
 */

import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "./ErrorFallback";

/**
 * @typedef {Object} AppLayoutProps
 * @property {React.ReactNode} children - 子組件內容
 */
interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * AppLayout 組件 - 應用主佈局
 *
 * @param {AppLayoutProps} props - 組件屬性
 * @returns {JSX.Element} AppLayout 元素
 *
 * 🧠 設計決策:
 * - Sticky Header: 保持標題可見性
 * - ErrorBoundary: 防止單一組件錯誤導致白屏
 * - Container: 使用 Tailwind container 類別保持響應式間距
 *
 * 💡 架構模式:
 * - 採用 App Shell 架構 (Header + Main Content)
 * - 使用 react-error-boundary 提供錯誤恢復能力
 */
function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 🎯 Header - 固定在頂部的導航列 */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <h1 className="text-lg font-semibold">Industrial Dashboard</h1>
        </div>
      </header>

      {/* 🛡️ Main Content with Error Boundary */}
      <main className="flex-1">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <div className="container py-6">{children}</div>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default AppLayout;
