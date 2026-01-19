/**
 * Watchlist Item 資料結構
 * @description 對應單一設備的監控卡片
 */
export interface WatchlistItem {
  id: string;
  name: string;
  status: "normal" | "warning" | "error";
  temperature: number;
  rpm: number;
  timestamp: string;
}

/**
 * DnD 排序狀態 (存於 Store)
 */
export interface WatchlistOrder {
  orderedIds: string[]; // 使用者拖曳後的 ID 順序
}
