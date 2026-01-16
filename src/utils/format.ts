/**

 * 提供時間、數字等常用格式化功能
 */

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
