/**
 * KPI API Layer
 *
 * GET /api/stats - KPI 統計資料
 *
 * 💡 使用 Zod 進行 Runtime 驗證，防止後端回傳 null 導致 UI 崩潰
 */

import { z } from "zod";
import { apiClient } from "../api";

//! =============== Zod Schemas ===============

const KPIItemSchema = z.object({
  value: z.number(),
  trend: z.number(),
  unit: z.string(),
});

const KPIDataSchema = z.object({
  productionOutput: KPIItemSchema,
  defectCount: KPIItemSchema,
  yieldRate: KPIItemSchema,
  downtimeAlerts: KPIItemSchema,
  utilizationRate: KPIItemSchema,
});

//! =============== TypeScript Types ===============

export type KPIItem = z.infer<typeof KPIItemSchema>;
export type KPIData = z.infer<typeof KPIDataSchema>;

//! =============== API Function ===============

/**
 * 取得 KPI 統計資料
 * @throws {ZodError} 如果 API 回傳格式錯誤
 */
export async function fetchKPI(): Promise<KPIData> {
  const raw = await apiClient.get("api/stats").json();
  return KPIDataSchema.parse(raw);
}
