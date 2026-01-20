/**
 * Chart API Layer
 * GET /api/chart - 24h 歷史資料
 * GET /api/chart/realtime - 即時資料點
 */

import { apiClient } from "@/services/api";

// ============ API Response Types (Column-based) ============

export interface ChartDataset {
  label: string;
  data: number[];
  color: string;
}

export interface ChartHistoryResponse {
  labels: string[];
  datasets: ChartDataset[];
}

export interface RealtimeDataset {
  label: string;
  value: number;
  color: string;
}

export interface ChartRealtimeResponse {
  label: string;
  datasets: RealtimeDataset[];
}

// ============ Internal Data Type (Row-based for Recharts) ============

export interface ChartDataPoint {
  [key: string]: string | number;
  time: string;
  production: number;
  defectCount: number;
  downtime: number;
  yield: number;
  efficiency: number;
}

// ============ API Functions ============

/**
 * 取得 24 小時歷史圖表資料
 * API 時間由 Ky hooks 自動記錄到 PerformanceStore
 */
export async function fetchChartHistory(): Promise<ChartHistoryResponse> {
  return apiClient.get("api/chart").json<ChartHistoryResponse>();
}

/**
 * 取得即時資料點 (每 5 分鐘呼叫)
 */
export async function fetchChartRealtime(): Promise<ChartRealtimeResponse> {
  return apiClient.get("api/chart/realtime").json<ChartRealtimeResponse>();
}
