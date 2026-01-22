/**
 * Chart Data Hook
 *
 * - 初始載入 24h 歷史資料
 * - Column → Row 資料轉換 + Reader Time 測量
 * - 可配置的 Polling 即時更新
 *
 * 💡 Zod 驗證已在 API 層處理，此處專注資料轉換
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback, useRef } from "react";
import {
  fetchChartHistory,
  fetchChartRealtime,
  type ChartHistoryResponse,
  type ChartRealtimeResponse,
  type ChartDataPoint,
} from "@/services/endpoints/chart";
import { usePerformanceStore } from "@/stores/usePerformanceStore";

//! =============== 1. 常量與型別定義 ===============

const QUERY_KEY = ["chart", "history"] as const;
const DEFAULT_POLLING_INTERVAL = 5 * 60 * 1000; // 5 分鐘
const DEFAULT_MAX_DATA_POINTS = 288; // 24h / 5min = 288 筆

export interface UseChartDataOptions {
  /** Polling 間隔 (ms)，預設 5 分鐘 */
  pollingInterval?: number;
  /** 資料視窗大小，預設 288 筆 */
  maxDataPoints?: number;
  /** 是否啟用 Polling，預設 true */
  enablePolling?: boolean;
}

export interface UseChartDataReturn {
  data: ChartDataPoint[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

//! =============== 2. 欄位映射配置 ===============

//* API Label → Internal Key 對照表
const FIELD_MAPPING: Record<string, keyof ChartDataPoint> = {
  Output: "production",
  Defects: "defectCount",
  Downtime: "downtime",
  "Yield Rate (%)": "yield",
  "Utilization (%)": "efficiency",
};

//! =============== 3. 純函式：資料轉換 ===============

/**
 * 記錄 Reader Time 到效能監控
 */
function recordReaderTime(startTime: number): void {
  const duration = performance.now() - startTime;
  console.log("[Perf] Chart Reader Time:", duration.toFixed(2), "ms");
  usePerformanceStore.getState().recordMetric("Chart Reader Time", duration);
}

/**
 * Column-based → Row-based 轉換
 *
 * 💡 簡化版：直接用 reduce 建立查找表，避免過度抽象
 */
function transformToRows(response: ChartHistoryResponse): ChartDataPoint[] {
  const startTime = performance.now();
  const { labels, datasets } = response;

  //* 建立 label → internalKey → data[] 的查找表
  const dataMap = datasets.reduce<Record<string, number[]>>((acc, dataset) => {
    const key = FIELD_MAPPING[dataset.label];
    if (key) acc[key] = dataset.data;
    return acc;
  }, {});

  //* 批次轉換為 Row-based
  const result = labels.map((time, i) => ({
    time,
    production: dataMap.production?.[i] ?? 0,
    defectCount: dataMap.defectCount?.[i] ?? 0,
    downtime: dataMap.downtime?.[i] ?? 0,
    yield: dataMap.yield?.[i] ?? 0,
    efficiency: dataMap.efficiency?.[i] ?? 0,
  }));

  recordReaderTime(startTime);
  return result;
}

/**
 * 合併即時資料點到現有資料
 *
 * 💡 簡化版：直接用 reduce 建立新資料點
 */
function mergeRealtimePoint(
  existingData: ChartDataPoint[],
  realtime: ChartRealtimeResponse,
  maxDataPoints: number,
): ChartDataPoint[] {
  const startTime = performance.now();

  //* 建立新資料點
  const newPoint = realtime.datasets.reduce<ChartDataPoint>(
    (point, dataset) => {
      const key = FIELD_MAPPING[dataset.label];
      if (key) (point as Record<string, string | number>)[key] = dataset.value;
      return point;
    },
    {
      time: realtime.label,
      production: 0,
      defectCount: 0,
      downtime: 0,
      yield: 0,
      efficiency: 0,
    },
  );

  //* 追加並維持視窗大小
  const updated = [...existingData, newPoint];
  const result =
    updated.length > maxDataPoints ? updated.slice(-maxDataPoints) : updated;

  recordReaderTime(startTime);
  return result;
}

//! =============== 5. 主 Hook ===============

/**
 * Chart 資料 Hook
 * @description 提供圖表歷史資料獲取與即時更新功能
 * @param options - 配置選項
 * @param options.pollingInterval - Polling 間隔 (ms)
 * @param options.maxDataPoints - 資料視窗大小
 * @param options.enablePolling - 是否啟用 Polling
 *
 * @example
 * // 預設配置
 * const { data, isLoading } = useChartData();
 *
 * // 自訂配置
 * const { data } = useChartData({
 *   pollingInterval: 60_000,
 *   maxDataPoints: 100,
 *   enablePolling: false,
 * });
 */
export function useChartData(
  options: UseChartDataOptions = {},
): UseChartDataReturn {
  const {
    pollingInterval = DEFAULT_POLLING_INTERVAL,
    maxDataPoints = DEFAULT_MAX_DATA_POINTS,
    enablePolling = true,
  } = options;

  const queryClient = useQueryClient();
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  //* 主查詢：歷史資料
  const {
    data: rawData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const response = await fetchChartHistory();
      return transformToRows(response);
    },
    staleTime: pollingInterval,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  //* Polling callback - 獨立函式，便於測試
  const pollRealtime = useCallback(async () => {
    try {
      const realtime = await fetchChartRealtime();

      queryClient.setQueryData<ChartDataPoint[]>(QUERY_KEY, (old) => {
        if (!old) return old;
        return mergeRealtimePoint(old, realtime, maxDataPoints);
      });
    } catch (err) {
      //? Silent fail - 不中斷 UI，僅記錄警告
      console.warn("[Chart] Realtime poll failed:", err);
    }
  }, [queryClient, maxDataPoints]);

  //* Polling Effect
  useEffect(() => {
    // Guard Clause: 等待初始資料載入 + 確認啟用 polling
    if (!rawData || !enablePolling) return;

    pollingRef.current = setInterval(pollRealtime, pollingInterval);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [rawData, pollRealtime, enablePolling, pollingInterval]);

  return {
    data: rawData ?? [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}
