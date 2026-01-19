/**
 * =====================================
 * ❤️ Watchlist Store - 監控清單狀態管理
 * =====================================
 * 管理使用者選擇要監控的設備 ID 列表
 * 🔄 重構：改用 Array 以支援拖曳排序
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

//! =============== 1. 設定與常量 ===============

const STORE_CONFIG = {
  NAME: "watchlist-store",
  STORAGE_KEY: "watchlist-storage",
} as const;

//! =============== 2. 類型與介面定義 ===============

/**
 * 批次加入結果
 * @interface BatchAddResult
 */
export interface BatchAddResult {
  /** 成功加入的 ID 列表 */
  added: string[];
  /** 已存在於監控清單中而被跳過的 ID 列表 */
  skipped: string[];
}

/**
 * Store 狀態定義
 * @interface WatchlistState
 */
interface WatchlistState {
  /** 監控中的機型名稱陣列 (順序即為顯示順序) */
  watchedTypes: string[];

  /**
   * 加入機型到監控清單
   * @param {string} type - 機型名稱
   */
  addType: (type: string) => void;

  /**
   * 從監控清單移除機型
   * @param {string} type - 機型名稱
   */
  removeType: (type: string) => void;

  /**
   * 設定機型順序 (用於拖曳排序)
   * @param {string[]} types - 新的機型順序
   */
  setTypes: (types: string[]) => void;

  /**
   * 檢查機型是否在監控清單中
   * @param {string} type - 機型名稱
   * @returns {boolean} 是否正在監控
   */
  isWatched: (type: string) => boolean;
}

//! =============== 3. Store 實作 (Zustand) ===============

/**
 * Watchlist Store
 *
 * 🧠 設計決策:
 * - 改用 string[] 儲存 ID，順序即為顯示順序
 * - 使用 Set 檢查重複，但不儲存 Set (避免序列化問題)
 * - 每次修改必須建立新陣列實例 (Zustand 使用淺比較)
 */
export const useWatchlistStore = create<WatchlistState>()(
  devtools(
    persist(
      (set, get) => ({
        watchedTypes: [],

        addType: (type: string) => {
          set(
            (state) => {
              if (state.watchedTypes.includes(type)) {
                return state; // 已存在，不更新
              }
              return { watchedTypes: [...state.watchedTypes, type] };
            },
            false,
            `addType/${type}`
          );
        },

        removeType: (type: string) => {
          set(
            (state) => {
              if (!state.watchedTypes.includes(type)) {
                return state; // 不存在，不更新
              }
              return { watchedTypes: state.watchedTypes.filter((t) => t !== type) };
            },
            false,
            `removeType/${type}`
          );
        },

        setTypes: (types: string[]) => {
          set({ watchedTypes: types }, false, "setTypes");
        },

        isWatched: (type: string) => {
          return get().watchedTypes.includes(type);
        },
      }),
      {
        name: STORE_CONFIG.STORAGE_KEY,
        // 💡 Array 直接序列化，不需要 custom storage
      }
    ),
    { name: STORE_CONFIG.NAME }
  )
);

//! =============== 4. Custom Hooks (Selector Pattern) ===============

/**
 * 檢查單一機型是否在監控清單中
 * @param {string} type - 機型名稱
 * @returns {boolean} 是否正在監控
 */
export function useIsWatched(type: string): boolean {
  return useWatchlistStore((state) => state.watchedTypes.includes(type));
}

/**
 * 取得監控清單的機型數量
 * @returns {number} 監控中的機型數量
 */
export function useWatchlistCount(): number {
  return useWatchlistStore((state) => state.watchedTypes.length);
}
