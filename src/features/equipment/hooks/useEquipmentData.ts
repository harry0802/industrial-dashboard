import { useQuery } from "@tanstack/react-query";
import { fetchEquipment } from "@/services/endpoints/equipment";

/**
 * Equipment 資料獲取 Hook
 * @description 使用 TanStack Query 獲取並快取設備資料
 *
 * 🧠 設計決策:
 * - 預設獲取 10,000 筆資料以進行壓力測試
 * - 快取策略: staleTime 30s, refetchInterval 60s
 * - 效能監控由 Ky hooks 自動處理 (src/services/api.ts)
 * - 直接透傳 API 資料，不進行任何轉換
 *
 * 💡 效能埋點:
 * - API Time: 由 apiClient (Ky) 的 hooks 自動記錄到 PerformanceStore
 *
 * @param {number} [count=10000] - 要獲取的設備數量 (預設 10,000 筆)
 * @returns {UseQueryResult<Equipment[]>} TanStack Query 結果
 *
 * @example
 * function MyComponent() {
 *   const { data, isLoading, error } = useEquipmentData();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return <Table data={data} />;
 * }
 *
 * @example
 * // 自訂數量
 * const { data } = useEquipmentData(5000);
 */
export function useEquipmentData(count: number = 10000) {
  return useQuery({
    queryKey: ["equipment", count],
    queryFn: () => fetchEquipment(count),

    // 快取配置
    staleTime: 30_000, // 30 秒內視為新鮮
    refetchInterval: 60_000, // 每 60 秒重新抓取

    // 錯誤處理
    retry: 2, // 失敗時重試 2 次
    retryDelay: 1000, // 重試延遲 1 秒
  });
}
