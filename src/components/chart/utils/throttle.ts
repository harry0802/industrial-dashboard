/**
 * Throttle Utilities
 * 用於控制高頻事件的執行頻率
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 節流函數 - 控制函數執行頻率
 *
 * @param func - 要節流的函數
 * @param limit - 節流間隔 (ms)
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * RequestAnimationFrame 節流 - 用於視覺更新
 * 確保更新與瀏覽器繪製同步，避免視覺卡頓
 *
 * @param func - 要節流的函數
 */
export function rafThrottle<T extends (...args: any[]) => void>(
  func: T,
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    if (rafId !== null) return;

    rafId = requestAnimationFrame(() => {
      func.apply(this, args);
      rafId = null;
    });
  };
}
