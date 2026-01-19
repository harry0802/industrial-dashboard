import Papa from "papaparse";
import { saveAs } from "file-saver";
import type { Equipment } from "../types";

/**
 * 匯出設備資料為 CSV
 * @description 使用 PapaParse 將資料轉換為 CSV 並觸發下載
 *
 * @param {Equipment[]} data - 要匯出的設備資料
 * @param {string} filename - 檔案名稱 (不含副檔名)
 *
 * @example
 * const data = [{ id: '1', machine: 'Welder E', ... }];
 * exportEquipmentToCSV(data, 'equipment-report');
 * // 下載檔案: equipment-report-2024-01-18.csv
 */
export function exportEquipmentToCSV(
  data: Equipment[],
  filename = "equipment-data"
) {
  // 格式化資料 (轉換欄位名稱與數值格式)
  const formattedData = data.map((item) => ({
    ID: item.id,
    Machine: item.machine,
    Status: item.status,
    "Temperature (°C)": item.temperature.toFixed(1),
    RPM: item.rpm,
    "Last Update": new Date(item.timestamp).toLocaleString(),
  }));

  // 轉換為 CSV
  const csv = Papa.unparse(formattedData);

  // 建立 Blob 並觸發下載
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const dateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  saveAs(blob, `${filename}-${dateStr}.csv`);
}
