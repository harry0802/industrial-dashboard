/**
 * Chart API Layer
 *
 * GET /api/chart - 24h 歷史資料
 * GET /api/chart/realtime - 即時資料點
 *
 * 💡 使用 Zod 進行 Runtime 驗證，防止後端回傳 null 導致 UI 崩潰
 */

import { z } from "zod";
import { apiClient } from "@/services/api";

//! =============== Zod Schemas (Single Source of Truth) ===============

//* 歷史資料 Schema
const ChartDatasetSchema = z.object({
  label: z.string(),
  data: z.array(z.number()),
  color: z.string(),
});

const ChartHistorySchema = z.object({
  labels: z.array(z.string()),
  datasets: z.array(ChartDatasetSchema),
});

//* 即時資料 Schema
const RealtimeDatasetSchema = z.object({
  label: z.string(),
  value: z.number(),
  color: z.string(),
});

const ChartRealtimeSchema = z.object({
  label: z.string(),
  datasets: z.array(RealtimeDatasetSchema),
});

//! =============== TypeScript Types (Auto-inferred) ===============

export type ChartDataset = z.infer<typeof ChartDatasetSchema>;
export type ChartHistoryResponse = z.infer<typeof ChartHistorySchema>;
export type RealtimeDataset = z.infer<typeof RealtimeDatasetSchema>;
export type ChartRealtimeResponse = z.infer<typeof ChartRealtimeSchema>;

//* Row-based 資料結構 (供 Recharts 使用)
export interface ChartDataPoint {
  [key: string]: string | number;
  time: string;
  production: number;
  defectCount: number;
  downtime: number;
  yield: number;
  efficiency: number;
}

//! =============== API Functions ===============

/**
 * 取得 24 小時歷史圖表資料
 * @throws {ZodError} 如果 API 回傳格式錯誤
 */
export async function fetchChartHistory(): Promise<ChartHistoryResponse> {
  const raw = await apiClient.get("api/chart").json();
  return ChartHistorySchema.parse(raw);
}

/**
 * 取得即時資料點 (每 5 分鐘呼叫)
 * @throws {ZodError} 如果 API 回傳格式錯誤
 */
export async function fetchChartRealtime(): Promise<ChartRealtimeResponse> {
  const raw = await apiClient.get("api/chart/realtime").json();
  return ChartRealtimeSchema.parse(raw);
}
