/**
 * Chart Context
 *
 * 雙 Context 架構：
 * - ChartDataContext: 較少變動的資料 (data, config, xDataKey)
 * - ChartInteractionContext: 頻繁變動的互動狀態 (range, selection, hiddenSeries)
 *
 * 分離的目的是避免不必要的 re-render
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useMemo,
  useId,
  useEffect,
  type ReactNode,
} from "react";
import type {
  ChartDataContextValue,
  ChartInteractionContextValue,
  ChartConfig,
  RangeState,
  SelectionState,
} from "../types";
import {
  createInitialRange,
  clampRange,
  checkIsZoomed,
} from "../utils/calculateRange";
import { useWheelZoom } from "../hooks/useWheelZoom";

//! =============== Context Definitions ===============

const ChartDataContext = createContext<ChartDataContextValue | null>(null);
const ChartInteractionContext =
  createContext<ChartInteractionContextValue | null>(null);

//! =============== Context Hooks ===============

export function useChartData(): ChartDataContextValue {
  const context = useContext(ChartDataContext);
  if (!context) {
    throw new Error("useChartData must be used within <Chart.Root>");
  }
  return context;
}

export function useChartInteraction(): ChartInteractionContextValue {
  const context = useContext(ChartInteractionContext);
  if (!context) {
    throw new Error("useChartInteraction must be used within <Chart.Root>");
  }
  return context;
}

/** 💡 Convenience hook for components that need both */
export function useChart() {
  return {
    ...useChartData(),
    ...useChartInteraction(),
  };
}

//! =============== Provider Props ===============

export interface ChartProviderProps {
  data: Record<string, unknown>[];
  config: ChartConfig;
  xDataKey: string;
  children: ReactNode;

  /** 外部控制 range (Controlled mode) */
  range?: RangeState;
  onRangeChange?: (range: RangeState) => void;

  /** 縮放設定 */
  zoomSpeed?: number;
  minZoomItems?: number;
}

//! =============== Provider Component ===============

export function ChartProvider({
  data,
  config,
  xDataKey,
  children,
  range: controlledRange,
  onRangeChange,
  zoomSpeed = 0.1,
}: ChartProviderProps) {
  const uniqueId = useId();
  const chartId = `chart-${uniqueId.replace(/:/g, "")}`;
  const canvasRef = useRef<HTMLDivElement>(null);

  // Internal range state (uncontrolled mode)
  const [internalRange, setInternalRange] = useState<RangeState>(() =>
    createInitialRange(data.length),
  );

  // Determine if controlled or uncontrolled
  const isControlled = controlledRange !== undefined;
  const range = isControlled ? controlledRange : internalRange;

  const setRange = useCallback(
    (newRange: RangeState) => {
      if (isControlled) {
        onRangeChange?.(newRange);
      } else {
        setInternalRange(newRange);
      }
    },
    [isControlled, onRangeChange],
  );

  // 資料長度變化時校正 range
  const safeRange = useMemo(
    () => clampRange(range, data.length),
    [range, data.length],
  );

  useEffect(() => {
    if (
      safeRange.startIndex !== range.startIndex ||
      safeRange.endIndex !== range.endIndex
    ) {
      setRange(safeRange);
    }
  }, [safeRange, range, setRange]);

  // Reset zoom
  const resetZoom = useCallback(() => {
    setRange(createInitialRange(data.length));
  }, [data.length, setRange]);

  // Derived state
  const isZoomed = useMemo(
    () => checkIsZoomed(range, data.length),
    [range, data.length],
  );

  // Selection state (drag-to-zoom)
  const [selection, setSelectionState] = useState<SelectionState>({
    startX: null,
    endX: null,
    isSelecting: false,
  });

  const setSelection = useCallback(
    (
      update: SelectionState | ((prev: SelectionState) => SelectionState),
    ) => {
      setSelectionState(update);
    },
    [],
  );

  // Commit selection to range
  const commitSelection = useCallback(() => {
    if (
      !selection.startX ||
      !selection.endX ||
      selection.startX === selection.endX
    ) {
      setSelectionState({ startX: null, endX: null, isSelecting: false });
      return;
    }

    const startIdx = data.findIndex((item) => item[xDataKey] === selection.startX);
    const endIdx = data.findIndex((item) => item[xDataKey] === selection.endX);

    if (startIdx !== -1 && endIdx !== -1) {
      const [min, max] = [startIdx, endIdx].sort((a, b) => a - b);
      setRange({ startIndex: min, endIndex: max });
    }

    setSelectionState({ startX: null, endX: null, isSelecting: false });
  }, [data, xDataKey, selection, setRange]);

  // Hidden series (legend toggle)
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const toggleSeries = useCallback((dataKey: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(dataKey)) {
        next.delete(dataKey);
      } else {
        next.add(dataKey);
      }
      return next;
    });
  }, []);

  // Wheel zoom hook
  useWheelZoom(canvasRef, range, setRange, data.length, zoomSpeed);

  // Memoize context values
  const dataContextValue = useMemo<ChartDataContextValue>(
    () => ({ data, xDataKey, config, chartId }),
    [data, xDataKey, config, chartId],
  );

  const interactionContextValue = useMemo<ChartInteractionContextValue>(
    () => ({
      range,
      isZoomed,
      setRange,
      resetZoom,
      selection,
      setSelection,
      commitSelection,
      hiddenSeries,
      toggleSeries,
      canvasRef,
    }),
    [
      range,
      isZoomed,
      setRange,
      resetZoom,
      selection,
      setSelection,
      commitSelection,
      hiddenSeries,
      toggleSeries,
    ],
  );

  return (
    <ChartDataContext.Provider value={dataContextValue}>
      <ChartInteractionContext.Provider value={interactionContextValue}>
        {children}
      </ChartInteractionContext.Provider>
    </ChartDataContext.Provider>
  );
}
