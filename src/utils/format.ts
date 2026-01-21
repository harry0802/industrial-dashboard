/**
 * 提供時間、數字等常用格式化功能
 */

//! =============== 數值格式化 ===============

//* 整數格式化器 (千分位逗號)
const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

//* 小數格式化器 (1 位小數)
const decimalFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/**
 * 格式化 KPI 指標數值
 *
 * @param value - 原始數值
 * @param unit - 單位 (用於判斷格式化規則)
 * @returns 格式化後的字串
 *
 * @example
 * formatMetricValue(12453, "pcs")     // "12,453"
 * formatMetricValue(98.69784, "%")    // "98.7"
 * formatMetricValue(3.14159, "hr")    // "3.1"
 */
export function formatMetricValue(value: number, unit?: string): string {
  //* 百分比或小數：保留 1 位小數
  if (unit === "%" || !Number.isInteger(value)) {
    return decimalFormatter.format(value);
  }

  //* 整數：千分位逗號
  return integerFormatter.format(value);
}

//! =============== 時間格式化 ===============

/**
 * 格式化毫秒時長為可讀字串
 *
 * @param {number} ms - 毫秒數
 * @returns {string} 格式化後的字串 (例: "150ms" 或 "2.50s")
 *
 * @example
 * formatDuration(450) // "450ms"
 * formatDuration(2500) // "2.50s"
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms.toFixed(0)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * 根據延遲時間判斷效能等級並返回對應的顏色類別
 *
 * @param {number} ms - 毫秒數
 * @returns {string} Tailwind 顏色類別
 *
 * @example
 * getPerformanceColor(300) // "text-green-600" (快速)
 * getPerformanceColor(800) // "text-yellow-600" (中等)
 * getPerformanceColor(1500) // "text-red-600" (慢速)
 */
export function getPerformanceColor(ms: number): string {
  if (ms < 500) return "text-green-600";
  if (ms < 1000) return "text-yellow-600";
  return "text-red-600";
}
