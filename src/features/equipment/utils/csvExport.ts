import Papa from "papaparse";
import { saveAs } from "file-saver";
import type { TFunction } from "i18next";
import type { Equipment } from "../types";

//! =============== Types ===============

interface ExportOptions {
  /** i18n 翻譯函數 */
  t: TFunction;
  /** 檔案名稱 (不含副檔名) */
  filename?: string;
  /** 日期時間格式化的語系 */
  locale?: string;
}

//! =============== Helpers ===============

/**
 * 翻譯狀態值
 * @description 將 API 回傳的狀態轉換為翻譯後的文字
 */
function translateStatus(status: string, t: TFunction): string {
  const statusKey = status.toLowerCase() as "normal" | "warning" | "error";
  return t(`equipment.status.${statusKey}`);
}

//! =============== Main Export Function ===============

/**
 * 匯出設備資料為 CSV (i18n 支援)
 * @description 使用 PapaParse 將資料轉換為已翻譯的 CSV 並觸發下載
 *
 * @param {Equipment[]} data - 要匯出的設備資料
 * @param {ExportOptions} options - 匯出選項 (含翻譯函數)
 *
 * @example
 * const { t, i18n } = useTranslation();
 * exportEquipmentToCSV(data, { t, locale: i18n.language });
 * // 下載檔案: equipment-data-2024-01-18.csv (標題與狀態已翻譯)
 */
export function exportEquipmentToCSV(
  data: Equipment[],
  { t, filename = "equipment-data", locale }: ExportOptions
) {
  // 💡 使用翻譯後的欄位名稱作為 CSV 標題
  const formattedData = data.map((item) => ({
    [t("equipment.columns.id")]: item.id,
    [t("equipment.columns.machine")]: item.machine,
    [t("equipment.columns.status")]: translateStatus(item.status, t),
    [t("equipment.columns.temperature")]: item.temperature.toFixed(1),
    [t("equipment.columns.rpm")]: item.rpm,
    [t("equipment.columns.timestamp")]: new Date(item.timestamp).toLocaleString(locale),
  }));

  // 轉換為 CSV
  const csv = Papa.unparse(formattedData);

  // 建立 Blob 並觸發下載
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const dateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  saveAs(blob, `${filename}-${dateStr}.csv`);
}
