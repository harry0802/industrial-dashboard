import { apiClient } from '../api';

//! =============== 型別定義 ===============

/**
 * Equipment Status
 */
export type EquipmentStatus = 'Normal' | 'Warning' | 'Error';

/**
 * Equipment (API Response)
 * @description 後端 GET /api/equipment 的回應格式
 */
export interface Equipment {
  id: string;
  machine: string;
  status: EquipmentStatus;
  temperature: number;
  rpm: number;
  timestamp: string;
}

//! =============== API 函數定義 ===============

/**
 * 獲取設備資料
 * @description 呼叫 GET /api/equipment 或 GET /api/equipment/{count} 取得設備列表
 *
 * @param count - 可選參數，指定要獲取的設備數量
 * @returns 設備資料陣列
 *
 * @example
 * // 獲取預設數量的設備
 * const data = await fetchEquipment();
 *
 * @example
 * // 獲取 10000 筆設備資料 (壓力測試)
 * const data = await fetchEquipment(10000);
 */
export const fetchEquipment = async (count?: number): Promise<Equipment[]> => {
  const endpoint = count ? `api/equipment/${count}` : 'api/equipment';
  return apiClient.get(endpoint).json<Equipment[]>();
};
