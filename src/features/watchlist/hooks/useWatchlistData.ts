import { useQuery } from "@tanstack/react-query";
import { submitWatchlist } from "@/services/endpoints/watchlist";
import { useWatchlistStore } from "@/stores/useWatchlistStore";
import { equipmentToWatchlistItem } from "../utils/mappers";
import type { WatchlistItem } from "../types";

/**
 * Watchlist 資料獲取 Hook
 * 🧠 設計邏輯:
 * - 監聽 Store 的 watchedTypes (機型名稱 Array)
 * - 每 3 秒 Polling API
 * - 自動轉換 Equipment → WatchlistItem
 * - ✨ 關鍵改變：
 *   1. 使用機型名稱作為 Stable Key
 *   2. API 可能回傳多筆同機型資料 → 取第一筆
 *   3. 依照 Store 的 watchedTypes 順序排序
 */
export function useWatchlistData() {
  // 💡 Selector 穩定性：直接取 state.watchedTypes (Array 引用穩定)
  const watchedTypes = useWatchlistStore((state) => state.watchedTypes);

  return useQuery({
    queryKey: ["watchlist", watchedTypes],
    queryFn: async (): Promise<WatchlistItem[]> => {
      if (watchedTypes.length === 0) {
        return []; // Guard Clause
      }

      // 1️⃣ 呼叫 API (發送機型名稱作為 ids 參數)
      const equipments = await submitWatchlist(watchedTypes);

      // 2️⃣ 轉換為 WatchlistItem
      const items = equipments.map(equipmentToWatchlistItem);

      // 3️⃣ ✨ 去重：每個機型取第一筆資料
      const typeMap = new Map<string, WatchlistItem>();
      items.forEach((item) => {
        if (!typeMap.has(item.name)) {
          typeMap.set(item.name, item);
        }
      });

      // 4️⃣ ✨ 依照 Store 的 watchedTypes 順序排序 (使用機型名稱)
      const sortedItems = watchedTypes
        .map((type) => typeMap.get(type))
        .filter(Boolean) as WatchlistItem[];

      return sortedItems;
    },
    enabled: watchedTypes.length > 0, // 💡 無機型時不打 API
    refetchInterval: 3000, // ✨ 3 秒 Polling
    staleTime: 1000,
    retry: 1, // 💡 減少重試次數 (POST 請求)
  });
}
