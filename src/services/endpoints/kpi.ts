import { apiClient } from "../api";

interface KPIItem {
  value: number;
  trend: number;
  unit: string;
}

export interface KPIData {
  productionOutput: KPIItem;
  defectCount: KPIItem;
  yieldRate: KPIItem;
  downtimeAlerts: KPIItem;
  utilizationRate: KPIItem;
}

export const fetchKPI = async (): Promise<KPIData> => {
  return apiClient.get("api/stats").json<KPIData>();
};
