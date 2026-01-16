/**
 * =====================================
 * 🚀 Application Entry Point
 * =====================================
 * 應用主入口 - 初始化所有全局設定
 */

import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import "./i18n/config"; // 初始化 i18n
import App from "./App.tsx";
import { useThemeStore } from "./stores/useThemeStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * ThemeInitializer - 主題初始化組件
 *
 * 🧠 設計決策:
 * - 在應用渲染前初始化主題，避免閃爍
 * - 使用 useEffect 在客戶端執行
 */
function ThemeInitializer({ children }: { children: React.ReactNode }) {
  const initTheme = useThemeStore((state) => state.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return <>{children}</>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeInitializer>
        <App />
      </ThemeInitializer>
    </QueryClientProvider>
  </StrictMode>
);
