/**
 * =====================================
 * 🎨 Theme Store - 主題狀態管理
 * =====================================
 * 管理深色/淺色模式，並自動同步至 DOM 與 LocalStorage
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

//! =============== 1. 設定與常量 ===============

const THEME_CONFIG = {
  STORAGE_KEY: "theme-storage",
  DARK_CLASS: "dark",
  LIGHT_CLASS: "light",
} as const;

//! =============== 2. 類型與介面定義 ===============

/**
 * 主題類型
 * @typedef {'light' | 'dark'} Theme
 */
export type Theme = "light" | "dark";

/**
 * 主題狀態介面
 * @interface ThemeState
 */
interface ThemeState {
  /** 當前主題 */
  theme: Theme;
  /**
   * 設定並套用主題
   * @param {Theme} theme - 目標主題
   */
  setTheme: (theme: Theme) => void;
  /**
   * 切換主題 (Light <-> Dark)
   * @description 提供便捷的切換方法
   */
  toggleTheme: () => void;
}

//! =============== 3. 核心功能實作 (DOM Logic) ===============

/**
 * 更新 DOM 主題樣式 (純副作用函數)
 * @param {Theme} theme - 目標主題
 *
 * 🧠 實作細節:
 * - 使用 classList.toggle 消除 if/else
 * - 設定 color-scheme 以支援原生 UI (捲軸、checkbox 等)
 */
function updateDomTheme(theme: Theme): void {
  const root = document.documentElement;
  const isDark = theme === "dark";

  // 1. Class 切換 (Tailwind Dark Mode 核心)
  root.classList.toggle(THEME_CONFIG.DARK_CLASS, isDark);
  // 可選：如果你明確需要 light class，取消下行註解
  // root.classList.toggle(THEME_CONFIG.LIGHT_CLASS, !isDark);

  // 2. Data Attribute (供 CSS Selector 使用)
  root.setAttribute("data-theme", theme);

  // 3. 原生 UI 配色 (讓捲軸和原生控制項變色)
  root.style.colorScheme = theme;
}

//! =============== 4. Store 實作 (Zustand) ===============

/**
 * 主題管理 Store
 *
 * 🧠 設計決策:
 * - 使用 persist middleware 自動讀寫 localStorage
 * - onRehydrateStorage: 確保頁面重整後自動套用樣式，無需 useEffect
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light", // 預設值

      setTheme: (theme) => {
        set({ theme });
        updateDomTheme(theme);
      },

      toggleTheme: () => {
        const nextTheme = get().theme === "light" ? "dark" : "light";
        // 複用 setTheme 以保持邏輯單一
        get().setTheme(nextTheme);
      },
    }),
    {
      name: THEME_CONFIG.STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),

      // ✨ Magic: 當 Storage 讀取完畢後，立即套用主題
      // 這消除了手動呼叫 initTheme 的需求
      onRehydrateStorage: () => (state) => {
        if (state) {
          updateDomTheme(state.theme);
        }
      },

      // 只持久化 theme 欄位，避免保存函數
      partialize: (state) => ({ theme: state.theme } as ThemeState),
    }
  )
);
