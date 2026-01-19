import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { toPng, toSvg } from 'html-to-image';

// =====================================================================
// Type Definitions
// =====================================================================

export type ChartType = 'line' | 'area' | 'bar';
export type LayoutDirection = 'horizontal' | 'vertical';

export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface IndexedDataPoint extends ChartDataPoint {
  __index: number;
}

export interface SeriesConfig {
  dataKey: string;
  type: ChartType;
  color: string;
  name?: string;
  yAxisId?: 'left' | 'right';
  strokeWidth?: number;
  strokeDasharray?: string;
  fillOpacity?: number;
  stackId?: string;
  label?: any;
  [key: string]: any; // 🔥 支援任意 Recharts props
}

interface ChartContextValue {
  // 核心資料
  data: ChartDataPoint[];
  indexedData: IndexedDataPoint[];
  visibleData: IndexedDataPoint[];

  // Zoom/Pan 狀態
  windowRange: [number, number] | null;
  setWindowRange: (range: [number, number] | null) => void;
  resetZoom: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  isDragging: boolean;
  currentWindow: [number, number];

  // Export 狀態
  isExporting: boolean;
  exportPNG: () => Promise<void>;
  exportSVG: () => Promise<void>;

  // Legend 狀態
  hiddenSeries: Set<string>;
  toggleSeries: (dataKey: string) => void;

  // Refs
  containerRef: React.RefObject<HTMLDivElement | null>;

  // 配置
  enableZoom: boolean;
  enablePan: boolean;
  xDataKey: string;

  // Mouse handlers
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
}

const ChartContext = createContext<ChartContextValue | null>(null);

// =====================================================================
// Public Hook: useInteractiveChart
// =====================================================================

export function useInteractiveChart() {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error(
      'useInteractiveChart must be used within InteractiveChart.Root'
    );
  }
  return context;
}

// =====================================================================
// Internal Hook: useChartData
// =====================================================================

function useChartData(
  data: ChartDataPoint[],
  windowRange: [number, number] | null
) {
  const indexedData = useMemo<IndexedDataPoint[]>(
    () => data.map((item, i) => ({ ...item, __index: i })),
    [data]
  );

  const currentWindow = useMemo<[number, number]>(() => {
    if (windowRange) return windowRange;
    return [0, Math.max(0, data.length - 1)];
  }, [windowRange, data.length]);

  const visibleData = useMemo(() => {
    const [start, end] = currentWindow;
    return indexedData.slice(Math.floor(start), Math.ceil(end) + 1);
  }, [indexedData, currentWindow]);

  return { indexedData, visibleData, currentWindow };
}

// =====================================================================
// Internal Hook: useChartZoomPan
// =====================================================================

const ZOOM_FACTOR = 0.05;
const MIN_ZOOM_POINTS = 5;
const DRAG_THRESHOLD = 15;

function useChartZoomPan(
  dataLength: number,
  enableZoom: boolean,
  enablePan: boolean
) {
  const [windowRange, setWindowRange] = useState<[number, number] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastClientX = useRef<number>(0);
  const dragAccumulator = useRef<number>(0);

  const resetZoom = useCallback(() => {
    setWindowRange(null);
  }, []);

  // 🔘 Button-based zoom controls
  const zoomIn = useCallback(() => {
    if (!enableZoom || dataLength === 0) return;

    const currentRange = windowRange || [0, dataLength - 1];
    const zoomResult = calculateZoom(currentRange, -100, dataLength);

    if (zoomResult) {
      setWindowRange(zoomResult);
    }
  }, [dataLength, enableZoom, windowRange]);

  const zoomOut = useCallback(() => {
    if (!enableZoom || dataLength === 0) return;

    const currentRange = windowRange || [0, dataLength - 1];
    const zoomResult = calculateZoom(currentRange, 100, dataLength);

    if (zoomResult) {
      setWindowRange(zoomResult);
    }
  }, [dataLength, enableZoom, windowRange]);

  // 🖱️ Mouse drag handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!enablePan) return;

      e.preventDefault();
      lastClientX.current = e.clientX;
      dragAccumulator.current = 0;
      setIsDragging(true);
    },
    [enablePan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!enablePan || !isDragging) return;

      const deltaX = e.clientX - lastClientX.current;
      lastClientX.current = e.clientX;
      dragAccumulator.current += deltaX;

      // 💡 Push Ifs Up - 檢查是否需要移動
      if (Math.abs(dragAccumulator.current) < DRAG_THRESHOLD) return;

      const panResult = calculatePan(
        windowRange || [0, dataLength - 1],
        dragAccumulator.current,
        dataLength
      );

      if (panResult) {
        setWindowRange(panResult.range);
        dragAccumulator.current = panResult.remainingDelta;
      }
    },
    [enablePan, isDragging, windowRange, dataLength]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragAccumulator.current = 0;
  }, []);

  return {
    windowRange,
    setWindowRange,
    resetZoom,
    zoomIn,
    zoomOut,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}

// 🧠 Pure Function: 計算縮放結果
function calculateZoom(
  currentRange: [number, number],
  deltaY: number,
  dataLength: number
): [number, number] | null {
  const [start, end] = currentRange;
  const currentLength = end - start;

  const direction = deltaY > 0 ? 1 : -1;
  const moveAmount = Math.max(1, Math.round(currentLength * ZOOM_FACTOR));

  let newStart = start - direction * moveAmount;
  let newEnd = end + direction * moveAmount;

  // 💡 Guard Clauses - 邊界檢查
  if (newStart < 0) newStart = 0;
  if (newEnd > dataLength - 1) newEnd = dataLength - 1;
  if (newEnd - newStart < MIN_ZOOM_POINTS) return null;

  return [newStart, newEnd];
}

// 🧠 Pure Function: 計算平移結果
function calculatePan(
  currentRange: [number, number],
  accumulatedDelta: number,
  dataLength: number
): { range: [number, number]; remainingDelta: number } | null {
  const steps = Math.trunc(accumulatedDelta / DRAG_THRESHOLD);
  if (steps === 0) return null;

  const moveIndexCount = -steps;
  const [start, end] = currentRange;
  const windowSize = end - start;
  const maxIndex = dataLength - 1;

  let newStart = start + moveIndexCount;
  let newEnd = end + moveIndexCount;

  // 💡 Guard Clauses - 邊界處理
  if (newStart < 0) {
    newStart = 0;
    newEnd = windowSize;
  }
  if (newEnd > maxIndex) {
    newEnd = maxIndex;
    newStart = maxIndex - windowSize;
  }

  return {
    range: [newStart, newEnd],
    remainingDelta: accumulatedDelta - steps * DRAG_THRESHOLD,
  };
}

// =====================================================================
// Internal Hook: useChartExport
// =====================================================================

interface ExportOptions {
  png?: { backgroundColor?: string; pixelRatio?: number };
  svg?: { backgroundColor?: string };
}

function useChartExport(
  containerRef: React.RefObject<HTMLDivElement | null>,
  filename?: string,
  options?: ExportOptions
) {
  const [isExporting, setIsExporting] = useState(false);

  const exportOptions = useMemo(
    () => ({
      png: {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        ...options?.png,
      },
      svg: {
        backgroundColor: '#ffffff',
        ...options?.svg,
      },
    }),
    [options]
  );

  // 🧠 抽取共用邏輯
  const executeExport = useCallback(
    async (
      exportFn: (element: HTMLElement, options: Record<string, unknown>) => Promise<string>,
      format: 'png' | 'svg'
    ) => {
      const container = containerRef.current;
      if (!container) return;

      setIsExporting(true);
      await new Promise((r) => setTimeout(r, 50)); // ✨ 等待動畫完成

      try {
        const exportConfig = exportOptions[format];
        const dataUrl = await exportFn(container, exportConfig);
        downloadFile(dataUrl, filename || 'chart', format);
      } catch (error) {
        console.error(`${format.toUpperCase()} Export failed:`, error);
      } finally {
        setIsExporting(false);
      }
    },
    [containerRef, exportOptions, filename]
  );

  const exportPNG = useCallback(
    () => executeExport(toPng, 'png'),
    [executeExport]
  );

  const exportSVG = useCallback(
    () => executeExport(toSvg, 'svg'),
    [executeExport]
  );

  return { exportPNG, exportSVG, isExporting };
}

// 🧠 Pure Function: 下載檔案
function downloadFile(dataUrl: string, filename: string, format: string) {
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().slice(0, 10);
  link.download = `${filename}-${timestamp}.${format}`;
  link.href = dataUrl;
  link.click();
}

// =====================================================================
// Internal Hook: useChartLegend
// =====================================================================

function useChartLegend() {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const toggleSeries = useCallback((dataKey: string) => {
    setHiddenSeries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dataKey)) {
        newSet.delete(dataKey);
      } else {
        newSet.add(dataKey);
      }
      return newSet;
    });
  }, []);

  return { hiddenSeries, toggleSeries };
}

// =====================================================================
// Provider Component
// =====================================================================

interface ChartProviderProps {
  data: ChartDataPoint[];
  children: React.ReactNode;
  enableZoom?: boolean;
  enablePan?: boolean;
  xDataKey?: string;
  exportFilename?: string;
  exportOptions?: ExportOptions;
}

export function ChartProvider({
  data,
  children,
  enableZoom = true,
  enablePan = true,
  xDataKey = '__index',
  exportFilename,
  exportOptions,
}: ChartProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const zoomPan = useChartZoomPan(
    data.length,
    enableZoom,
    enablePan
  );
  const dataState = useChartData(data, zoomPan.windowRange);
  const exportState = useChartExport(
    containerRef,
    exportFilename,
    exportOptions
  );
  const legendState = useChartLegend();

  const value = useMemo<ChartContextValue>(
    () => ({
      data,
      ...dataState,
      ...zoomPan,
      ...exportState,
      ...legendState,
      containerRef,
      enableZoom,
      enablePan,
      xDataKey,
    }),
    [
      data,
      dataState,
      zoomPan,
      exportState,
      legendState,
      enableZoom,
      enablePan,
      xDataKey,
    ]
  );

  return (
    <ChartContext.Provider value={value}>{children}</ChartContext.Provider>
  );
}
