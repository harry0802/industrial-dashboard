/**
 * =====================================
 * 📝 Equipment Types - 設備資料型別定義
 * =====================================
 */

//! =============== API 回應型別 ===============

/**
 * Equipment (API Response)
 * @description 後端 API 回傳的設備資料結構 (完全一致)
 */
export interface Equipment {
  id: string;
  machine: string;
  status: EquipmentStatus;
  temperature: number;
  rpm: number;
  timestamp: string;
}

//! =============== 設備狀態類型 ===============

/**
 * 設備狀態
 */
export type EquipmentStatus = "Normal" | "Warning" | "Error";

//! =============== 表格狀態類型 ===============

/**
 * 表格篩選狀態
 * @interface EquipmentFilters
 */
export interface EquipmentFilters {
  /** 全域搜尋關鍵字 */
  globalFilter: string;
  /** 狀態篩選 (多選) */
  statusFilter: EquipmentStatus[];
  /** 機台類型篩選 (多選) */
  machineTypeFilter: string[];
}

/**
 * 欄位排序狀態
 * @interface EquipmentSorting
 */
export interface EquipmentSorting {
  /** 欄位 ID */
  id: string;
  /** 是否降序排列 */
  desc: boolean;
}

//! =============== 搜尋範圍類型 ===============

/**
 * 搜尋範圍
 * @description 定義搜尋可套用的欄位範圍
 */
export type SearchScope = "all" | "id" | "machine" | "status";

/**
 * 搜尋範圍選項
 * @description 用於 Select 元件的選項列表
 */
export const SEARCH_SCOPE_OPTIONS = [
  { value: "all" as const, label: "All Fields" },
  { value: "id" as const, label: "ID" },
  { value: "machine" as const, label: "Machine" },
  { value: "status" as const, label: "Status" },
] as const;
