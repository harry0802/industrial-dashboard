/**
 * =====================================
 * 📊 Performance Store - 效能監控狀態管理
 * =====================================
 * 集中管理 API 請求延遲與效能指標
 * 整合 DevTools 以利除錯
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";

//! =============== 1. 設定與常量 ===============

const STORE_CONFIG = {
  NAME: "performance-monitor",
  MAX_HISTORY: 50, // (可選) 未來可限制保存的指標數量
} as const;

//! =============== 2. 類型與介面定義 ===============

/**
 * 單一效能指標
 * @typedef {Object} PerformanceMetric
 * @property {string} name - 指標識別符 (API 路徑)
 * @property {number} value - 延遲時間 (ms)
 * @property {number} timestamp - 記錄時間
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

/**
 * Store 狀態定義
 * @interface PerformanceState
 */
interface PerformanceState {
  /** 指標雜湊表 (Key: API Path) */
  metrics: Record<string, PerformanceMetric>;

  /** * 記錄新的效能指標
   * @param {string} name - API 路徑
   * @param {number} value - 耗時 (ms)
   */
  recordMetric: (name: string, value: number) => void;

  /** 清空所有記錄 */
  clearMetrics: () => void;
}

//! =============== 3. Store 實作 (Zustand) ===============

/**
 * 效能監控 Store
 * * 🧠 設計決策:
 * - 使用 devtools middleware: 允許在瀏覽器擴充功能中查看狀態變化
 * - 移除 getMetric: 改用 Selector 模式 (見下方 Hooks)，確保 React 響應性
 */
export const usePerformanceStore = create<PerformanceState>()(
  devtools(
    (set) => ({
      metrics: {},

      recordMetric: (name, value) => {
        set(
          (state) => ({
            metrics: {
              ...state.metrics,
              [name]: {
                name,
                value,
                timestamp: Date.now(),
              },
            },
          }),
          false,
          `recordMetric/${name}`, // Action Name for DevTools
        );
      },

      clearMetrics: () => {
        set({ metrics: {} }, false, "clearMetrics");
      },
    }),
    { name: STORE_CONFIG.NAME },
  ),
);

//! =============== 4. Custom Hooks (Selector Pattern) ===============

/**
 * 單一指標訂閱 Hook
 * @description 僅當指定名稱的指標更新時，組件才會重新渲染 (Atomic Update)
 * * @param {string} name - 要監控的指標名稱 (API 路徑)
 * @returns {PerformanceMetric | undefined} 指標資料
 * * @example
 * const { value } = useMetric('api/dashboard/stats') || {};
 */
export function useMetric(name: string): PerformanceMetric | undefined {
  return usePerformanceStore((state) => state.metrics[name]);
}

/**
 * 整體平均延遲 Hook
 * @description 計算所有記錄 API 的平均延遲
 * @returns {number} 平均毫秒數 (整數)
 */
export function useAverageLatency(): number {
  return usePerformanceStore((state) => {
    const values = Object.values(state.metrics);
    if (values.length === 0) return 0;

    const total = values.reduce((acc, curr) => acc + curr.value, 0);
    return Math.round(total / values.length);
  });
}
