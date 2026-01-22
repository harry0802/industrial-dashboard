/**
 * =====================================
 * 🚀 Application Entry Point
 * =====================================
 * 應用主入口 - 初始化所有全局設定
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import "./i18n/config"; // 初始化 i18n
import App from "./App.tsx";

// 🧠 設定 QueryClient
// 預設 retry: 1 避免失敗時無限重試
// refetchOnWindowFocus: false 避免切換視窗時頻繁請求
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * 應用程式渲染
 * * 💡 主題初始化說明:
 * 由於 useThemeStore 使用了 persist middleware 的 onRehydrateStorage，
 * 主題會在 Zustand 啟動時自動應用到 DOM，因此此處無需額外的初始化組件。
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
