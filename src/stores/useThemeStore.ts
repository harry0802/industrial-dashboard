/**
 * =====================================
 * 🎨 主題管理 Store (Zustand)
 * =====================================
 * 管理深色/淺色模式切換
 * 使用 Zustand 保持狀態管理一致性
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * 主題類型定義
 */
export type Theme = "light" | "dark" | "system";

/**
 * 主題狀態定義
 */
interface ThemeState {
  /** 當前主題設定 */
  theme: Theme;
  /** 實際應用的主題 (解析 system 後的結果) */
  resolvedTheme: "light" | "dark";
  /** 設定主題 */
  setTheme: (theme: Theme) => void;
  /** 初始化主題 (解析 system 偏好) */
  initTheme: () => void;
}

/**
 * 獲取系統偏好的主題
 */
function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * 應用主題到 DOM
 */
function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;

  // 移除舊的 class
  root.classList.remove("light", "dark");

  // 添加新的 class
  root.classList.add(theme);

  // 設定 data attribute (供 CSS 使用)
  root.setAttribute("data-theme", theme);
}

/**
 * 主題管理 Zustand Store
 *
 * 🧠 設計決策:
 * - 使用 persist middleware 保存用戶偏好到 localStorage
 * - 支援 system 模式自動跟隨系統主題
 * - 監聽系統主題變化並自動更新
 *
 * 💡 使用方式:
 * - setTheme: 切換主題 ('light' | 'dark' | 'system')
 * - initTheme: 初始化時調用，解析 system 偏好
 *
 * @example
 * // 切換主題
 * useThemeStore.getState().setTheme('dark')
 *
 * @example
 * // 讀取當前主題
 * const theme = useThemeStore(state => state.theme)
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "system",
      resolvedTheme: "light",

      setTheme: (theme: Theme) => {
        set({ theme });

        // 解析實際要應用的主題
        const resolvedTheme =
          theme === "system" ? getSystemTheme() : theme;

        set({ resolvedTheme });
        applyTheme(resolvedTheme);
      },

      initTheme: () => {
        const { theme } = get();
        const resolvedTheme =
          theme === "system" ? getSystemTheme() : theme;

        set({ resolvedTheme });
        applyTheme(resolvedTheme);

        // 監聽系統主題變化
        if (theme === "system") {
          const mediaQuery = window.matchMedia(
            "(prefers-color-scheme: dark)"
          );

          const handleChange = () => {
            if (get().theme === "system") {
              const newTheme = getSystemTheme();
              set({ resolvedTheme: newTheme });
              applyTheme(newTheme);
            }
          };

          mediaQuery.addEventListener("change", handleChange);
        }
      },
    }),
    {
      name: "theme-storage", // localStorage key
      partialize: (state) => ({ theme: state.theme }), // 只保存 theme
    }
  )
);
