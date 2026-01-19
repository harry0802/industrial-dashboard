import { apiClient } from "../api";
import type { Equipment } from "@/features/equipment/types";

/**
 * POST /api/watchlist
 * @description 提交監控清單 ID，取得對應設備資料
 * @param equipmentIds - 設備 ID 陣列
 * @returns Equipment[] (可能為空陣列)
 *
 * ⚠️ API 注意事項:
 * - 測試時回傳空陣列 []
 * - 需妥善處理空回應 (顯示 Fallback UI)
 */
export async function submitWatchlist(
  equipmentIds: string[]
): Promise<Equipment[]> {
  if (equipmentIds.length === 0) {
    return []; // 🧠 Guard Clause - 避免無效請求
  }

  try {
    return await apiClient
      .post("api/watchlist", {
        json: { ids: equipmentIds },
      })
      .json<Equipment[]>();
  } catch (error) {
    console.error("[Watchlist API] Failed to fetch:", error);
    return []; // 💡 錯誤時回傳空陣列，避免中斷 UI
  }
}
