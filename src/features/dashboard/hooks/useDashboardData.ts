import { useMemo } from "react";
import {
  mockStats,
  mockChartData,
  mockEquipments,
  mockWatchlist,
  type StatMetric,
  type ChartDataPoint,
  type Equipment,
  type WatchlistItem,
} from "@/mocks/data";

interface DashboardData {
  stats: StatMetric[];
  chartData: ChartDataPoint[];
  equipments: Equipment[];
  watchlist: WatchlistItem[];
}

/**
 * 儀表板資料 Hook
 * @description 集中管理資料獲取邏輯，未來可在此替換為真實 API 呼叫 (React Query / SWR)
 * @returns {DashboardData} 儀表板所需的各項資料
 */
export function useDashboardData(): DashboardData {
  // 模擬資料獲取 (在真實場景中，這裡會是 useQuery)
  const data = useMemo(
    () => ({
      stats: mockStats,
      chartData: mockChartData,
      equipments: mockEquipments,
      watchlist: mockWatchlist,
    }),
    []
  );

  return data;
}
