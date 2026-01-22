/**
 * Equipment API Layer
 *
 * GET /api/equipment - 設備列表
 *
 * 💡 使用 Zod 進行 Runtime 驗證，防止後端回傳異常資料導致 UI 崩潰
 */
import { apiClient } from "../api";
import {
  EquipmentListSchema,
  type Equipment,
} from "@/features/equipment/schemas";

//! =============== API 函數定義 ===============

/**
 * 獲取設備資料
 * @throws {ZodError} 如果 API 回傳格式錯誤
 */
export async function fetchEquipment(count?: number): Promise<Equipment[]> {
  const endpoint = count ? `api/equipment/${count}` : "api/equipment";
  const raw = await apiClient.get(endpoint).json();
  return EquipmentListSchema.parse(raw);
}
