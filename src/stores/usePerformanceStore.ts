/**
 * =====================================
 * 📊 效能監控 Store (Zustand)
 * =====================================
 * 全局狀態管理：儲存和管理 API 請求效能指標
 */

import { create } from "zustand";

/**
 * 效能指標資料結構
 *
 * @typedef {Object} PerformanceMetric
 * @property {string} name - 指標名稱 (通常為 API 路徑)
 * @property {number} value - 效能數值 (毫秒)
 * @property {number} timestamp - 記錄時間戳
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

/**
 * 效能監控 Store 狀態定義
 *
 * @typedef {Object} PerformanceState
 * @property {Record<string, PerformanceMetric>} metrics - 效能指標集合
 * @property {(name: string, value: number) => void} recordMetric - 記錄新指標
 * @property {(name: string) => PerformanceMetric | undefined} getMetric - 取得指定指標
 * @property {() => void} clearMetrics - 清空所有指標
 */
interface PerformanceState {
  metrics: Record<string, PerformanceMetric>;
  recordMetric: (name: string, value: number) => void;
  getMetric: (name: string) => PerformanceMetric | undefined;
  clearMetrics: () => void;
}

/**
 * 效能監控 Zustand Store
 *
 * 🧠 設計決策:
 * - 使用 Record<string, PerformanceMetric> 而非陣列
 * - 同名指標會覆蓋 (保留最新值)，避免記憶體無限增長
 * - timestamp 用於排序和時間追蹤
 *
 * 💡 使用方式:
 * - recordMetric: 從 Ky hooks 中調用記錄 API 延遲
 * - getMetric: 查詢特定 API 的效能數據
 * - clearMetrics: 重置所有監控數據
 *
 * @example
 * // 記錄指標
 * usePerformanceStore.getState().recordMetric('api/kpi', 450)
 *
 * @example
 * // 讀取指標
 * const metrics = usePerformanceStore(state => state.metrics)
 */
export const usePerformanceStore = create<PerformanceState>((set, get) => ({
  metrics: {},

  recordMetric: (name, value) => {
    set((state) => ({
      metrics: {
        ...state.metrics,
        [name]: {
          name,
          value,
          timestamp: Date.now(),
        },
      },
    }));
  },

  getMetric: (name) => {
    return get().metrics[name];
  },

  clearMetrics: () => {
    set({ metrics: {} });
  },
}));
