/**
 * Chart Range Calculation Utilities
 * 純函數：不依賴 React，可獨立測試
 */

import type { RangeState } from "../types";

export const MIN_ZOOM_ITEMS = 5;

/**
 * 計算縮放後的範圍 (支援滑鼠焦點縮放)
 *
 * @param currentRange - 當前範圍
 * @param totalLength - 資料總長度
 * @param zoomAmount - 縮放量 (正值=放大/縮小範圍，負值=縮小/擴大範圍)
 * @param focusPercentage - 焦點位置百分比 (0-1)
 */
export function calculateNewRange(
  currentRange: RangeState,
  totalLength: number,
  zoomAmount: number,
  focusPercentage: number,
): RangeState {
  const { startIndex, endIndex } = currentRange;

  // 防止範圍小於最小限制且還在繼續放大
  if (endIndex - startIndex <= MIN_ZOOM_ITEMS && zoomAmount > 0) {
    return currentRange;
  }

  // zoomAmount > 0 : 放大 (縮小範圍)
  // zoomAmount < 0 : 縮小 (擴大範圍)
  const newStart = Math.max(
    0,
    startIndex + Math.floor(zoomAmount * focusPercentage),
  );

  const newEnd = Math.min(
    totalLength - 1,
    endIndex - Math.ceil(zoomAmount * (1 - focusPercentage)),
  );

  // 防呆：如果計算結果導致交叉，則不更新
  if (newStart >= newEnd - MIN_ZOOM_ITEMS) {
    return currentRange;
  }

  return { startIndex: newStart, endIndex: newEnd };
}

/**
 * 校正範圍，確保在有效資料範圍內
 *
 * @param range - 當前範圍
 * @param dataLength - 資料長度
 */
export function clampRange(range: RangeState, dataLength: number): RangeState {
  const maxEnd = Math.max(0, dataLength - 1);
  return {
    startIndex: Math.min(range.startIndex, maxEnd),
    endIndex: Math.min(range.endIndex, maxEnd),
  };
}

/**
 * 建立初始範圍 (顯示全部資料)
 *
 * @param dataLength - 資料長度
 */
export function createInitialRange(dataLength: number): RangeState {
  return {
    startIndex: 0,
    endIndex: Math.max(0, dataLength - 1),
  };
}

/**
 * 判斷是否處於縮放狀態
 *
 * @param range - 當前範圍
 * @param dataLength - 資料長度
 */
export function checkIsZoomed(range: RangeState, dataLength: number): boolean {
  return range.startIndex > 0 || range.endIndex < dataLength - 1;
}
