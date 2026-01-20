/**
 * useWheelZoom Hook
 *
 * 處理滑鼠滾輪與觸控縮放
 * - 支援滑鼠焦點縮放 (以游標位置為中心)
 * - 支援觸控雙指縮放
 * - RAF 節流避免過度更新
 */

import { useEffect, useRef } from "react";
import type { RangeState } from "../types";
import { calculateNewRange, MIN_ZOOM_ITEMS } from "../utils/calculateRange";
import { rafThrottle, throttle } from "../utils/throttle";

export function useWheelZoom(
  ref: React.RefObject<HTMLDivElement | null>,
  range: RangeState,
  onRangeChange: (newRange: RangeState) => void,
  totalLength: number,
  zoomSpeed: number = 0.1,
): void {
  const lastTouchDistance = useRef<number | null>(null);

  // 使用 ref 保存最新值，避免 effect 重新訂閱
  const rangeRef = useRef(range);
  const onRangeChangeRef = useRef(onRangeChange);

  useEffect(() => {
    rangeRef.current = range;
  }, [range]);

  useEffect(() => {
    onRangeChangeRef.current = onRangeChange;
  }, [onRangeChange]);

  useEffect(() => {
    const element = ref.current;
    if (!element || totalLength === 0) return;

    // 通用縮放處理 - 使用 ref 避免閉包陷阱
    const performZoom = (direction: number, clientX: number) => {
      const currentRange = rangeRef.current;
      const { startIndex, endIndex } = currentRange;
      const currentLength = endIndex - startIndex;

      // 邊界檢查
      if (currentLength <= MIN_ZOOM_ITEMS && direction > 0) return;

      const zoomAmount = currentLength * zoomSpeed * direction;
      const rect = element.getBoundingClientRect();
      const mouseX = clientX - rect.left;
      const focusPercentage = Math.max(0, Math.min(1, mouseX / rect.width));

      const newRange = calculateNewRange(
        currentRange,
        totalLength,
        zoomAmount,
        focusPercentage,
      );

      if (
        newRange.startIndex !== currentRange.startIndex ||
        newRange.endIndex !== currentRange.endIndex
      ) {
        onRangeChangeRef.current(newRange);
      }
    };

    // 節流處理 - 16ms (60fps)
    const throttledZoom = rafThrottle(performZoom);

    // 滑鼠滾輪事件
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const direction = e.deltaY < 0 ? 1 : -1;
      throttledZoom(direction, e.clientX);
    };

    // 觸控事件
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        lastTouchDistance.current = null;
      }
    };

    // 觸控移動節流
    const handleTouchMove = throttle((e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      e.preventDefault();

      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY,
      );

      if (lastTouchDistance.current !== null) {
        const direction = currentDistance > lastTouchDistance.current ? 1 : -1;
        const centerClientX = (touch1.clientX + touch2.clientX) / 2;
        performZoom(direction, centerClientX);
      }

      lastTouchDistance.current = currentDistance;
    }, 16);

    element.addEventListener("wheel", handleWheel, { passive: false });
    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove as EventListener, {
      passive: false,
    });

    return () => {
      element.removeEventListener("wheel", handleWheel);
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove as EventListener);
    };
  }, [ref, totalLength, zoomSpeed]);
}
