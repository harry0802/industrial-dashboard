/**
 * Chart Compound Components - Shared Types
 */

import type { ReactNode, RefObject } from "react";

//! =============== Range & Selection ===============

export interface RangeState {
  startIndex: number;
  endIndex: number;
}

export interface SelectionState {
  startX: string | null;
  endX: string | null;
  isSelecting: boolean;
}

//! =============== Chart Config ===============

export interface ChartConfigItem {
  label?: ReactNode;
  color?: string;
  theme?: Record<"light" | "dark", string>;
}

export type ChartConfig = Record<string, ChartConfigItem>;

//! =============== Series ===============

export type SeriesType = "line" | "area" | "bar";

export interface SeriesProps {
  dataKey: string;
  type?: SeriesType;
  yAxisId?: "left" | "right";
  color?: string;
  name?: string;
  strokeWidth?: number;
  fillOpacity?: number;
  strokeDasharray?: string;
  fill?: string;
}

//! =============== Context Types ===============

/** Data Context - 較少變動的資料 */
export interface ChartDataContextValue {
  data: Record<string, unknown>[];
  xDataKey: string;
  config: ChartConfig;
  chartId: string;
}

/** Interaction Context - 頻繁變動的互動狀態 */
export interface ChartInteractionContextValue {
  // Range
  range: RangeState;
  isZoomed: boolean;
  setRange: (range: RangeState) => void;
  resetZoom: () => void;

  // Selection (drag-to-zoom)
  selection: SelectionState;
  setSelection: (
    update: SelectionState | ((prev: SelectionState) => SelectionState),
  ) => void;
  commitSelection: () => void;

  // Legend toggle
  hiddenSeries: Set<string>;
  toggleSeries: (dataKey: string) => void;

  // Canvas ref for wheel zoom
  canvasRef: RefObject<HTMLDivElement | null>;
}

//! =============== Recharts Event Types ===============

export interface ChartMouseEvent {
  activeLabel?: string;
  activePayload?: unknown[];
}

export interface BrushChangeEvent {
  startIndex?: number;
  endIndex?: number;
}
