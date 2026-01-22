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

      // 2️⃣ 建立 查詢ID → WatchlistItem 映射
      // 🧠 API 回傳的 equipment.id 是我們傳入的查詢值 (機型名稱)
      //    equipment.machine 可能是不同的值，所以用 id 來比對
      const idToItemMap = new Map<string, WatchlistItem>();
      for (const eq of equipments) {
        if (!idToItemMap.has(eq.id)) {
          idToItemMap.set(eq.id, equipmentToWatchlistItem(eq));
        }
      }

      // 3️⃣ 依照 Store 的 watchedTypes 順序排序
      const sortedItems = watchedTypes
        .map((type) => idToItemMap.get(type))
        .filter(Boolean) as WatchlistItem[];

      return sortedItems;
    },
    enabled: watchedTypes.length > 0, // 💡 無機型時不打 API
    refetchInterval: 3000, // ✨ 3 秒 Polling
    staleTime: 1000,
    retry: 1, // 💡 減少重試次數 (POST 請求)
  });
}
