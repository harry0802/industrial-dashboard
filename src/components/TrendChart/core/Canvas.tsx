import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CHART_CONSTANTS } from "../config";
import { defaultRenderers } from "./renderers/registry";
import type { CanvasProps, IndexedDataPoint } from "./types";

/**
 * 🎨 Canvas - 獨立的圖表渲染器
 *
 * **設計原則**:
 * - 無 Context 依賴,可獨立使用
 * - 支援受控 (controlled) 與非受控 (uncontrolled) 模式
 * - 渲染器可擴展 (通過 renderersMap)
 *
 * **受控模式**:
 * ```tsx
 * const [window, setWindow] = useState([0, 100]);
 * <Canvas
 *   data={data}
 *   currentWindow={window}
 *   onWindowChange={setWindow}
 * />
 * ```
 *
 * **非受控模式**:
 * ```tsx
 * <Canvas data={data} defaultWindow={[0, 100]} />
 * ```
 */
export function Canvas({
  data,
  chartType: controlledChartType,
  currentWindow: controlledWindow,
  isDragging: controlledIsDragging,
  onWindowChange,
  onChartTypeChange,
  defaultChartType = "area",
  defaultWindow,
  renderersMap = defaultRenderers,
  className,
  enableZoom = true,
  enablePan = true,
}: CanvasProps) {
  // --- 🧠 受控/非受控狀態管理 ---

  // Chart Type (內部狀態僅在非受控時使用)
  const [internalChartType, setInternalChartType] = useState(defaultChartType);
  const chartType = controlledChartType ?? internalChartType;

  // Window Range (內部狀態僅在非受控時使用)
  const [internalWindow, setInternalWindow] = useState<[number, number] | null>(
    defaultWindow ?? null
  );
  const windowRange = controlledWindow
    ? ([controlledWindow[0], controlledWindow[1]] as [number, number])
    : internalWindow;

  // isDragging (內部狀態僅在非受控時使用)
  const [internalIsDragging, setInternalIsDragging] = useState(false);
  const isDragging = controlledIsDragging ?? internalIsDragging;

  // --- Refs ---
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const lastClientX = useRef<number>(0);
  const dragAccumulator = useRef<number>(0);

  // --- 計算當前視窗 ---
  const currentWindow = useMemo<[number, number]>(() => {
    if (windowRange) return windowRange;
    return [0, Math.max(0, data.length - 1)];
  }, [windowRange, data.length]);

  // --- 索引化資料 ---
  const indexedData = useMemo<IndexedDataPoint[]>(
    () => data.map((item, i) => ({ ...item, index: i })),
    [data]
  );

  // --- 🔧 Props 穩定化 (useMemo 確保 Recharts 不會不必要重渲染) ---
  const formatXAxis = useCallback(
    (index: number) => indexedData[index]?.time || "",
    [indexedData]
  );

  const stableProps = useMemo(
    () => ({
      xAxisProps: {
        dataKey: "index",
        type: "number" as const,
        domain: [currentWindow[0], currentWindow[1]],
        tickFormatter: formatXAxis,
        tick: { fontSize: 12, fill: "hsl(var(--muted-foreground))" },
      },
      yAxisLeftProps: {
        yAxisId: "left",
        label: { value: "Output", angle: -90, position: "insideLeft" as const },
      },
      yAxisRightProps: {
        yAxisId: "right",
        orientation: "right" as const,
        label: {
          value: "Rate (%)",
          angle: 90,
          position: "insideRight" as const,
        },
      },
      tooltipProps: {
        labelFormatter: formatXAxis,
        contentStyle: {
          backgroundColor: "hsl(var(--popover))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius)",
        },
      },
      legendProps: {
        iconType: "line" as const,
        wrapperStyle: { paddingTop: "1rem" },
      },
      chartMargin: { top: 5, right: 30, left: 20, bottom: 5 },
    }),
    [currentWindow, formatXAxis]
  );

  // --- 🎨 動態渲染器選擇 ---
  const Renderer = renderersMap[chartType as string] ?? renderersMap.area;

  // --- 🟢 滾輪縮放邏輯 ---
  useEffect(() => {
    if (!enableZoom) return;

    const container = chartContainerRef.current;
    if (!container || data.length === 0) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const currentRange = windowRange || [0, data.length - 1];
      const [start, end] = currentRange;
      const currentLength = end - start;

      const direction = e.deltaY > 0 ? 1 : -1;
      const moveAmount = Math.max(
        1,
        Math.round(currentLength * CHART_CONSTANTS.ZOOM_FACTOR)
      );

      let newStart = start - direction * moveAmount;
      let newEnd = end + direction * moveAmount;

      if (newStart < 0) newStart = 0;
      if (newEnd > data.length - 1) newEnd = data.length - 1;

      if (newEnd - newStart < CHART_CONSTANTS.MIN_ZOOM_POINTS) {
        return;
      }

      const newWindow: [number, number] = [newStart, newEnd];

      // 受控模式: 調用回調
      if (onWindowChange) {
        onWindowChange(newWindow);
      } else {
        // 非受控模式: 更新內部狀態
        setInternalWindow(newWindow);
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [data.length, enableZoom, windowRange, onWindowChange]);

  // --- 🟢 拖曳邏輯 ---
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!enablePan) return;
      e.preventDefault();
      lastClientX.current = e.clientX;
      dragAccumulator.current = 0;

      if (controlledIsDragging === undefined) {
        setInternalIsDragging(true);
      }
    },
    [enablePan, controlledIsDragging]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!enablePan || !isDragging) return;

      const deltaX = e.clientX - lastClientX.current;
      lastClientX.current = e.clientX;
      dragAccumulator.current += deltaX;

      if (Math.abs(dragAccumulator.current) >= CHART_CONSTANTS.DRAG_THRESHOLD) {
        const steps = Math.trunc(
          dragAccumulator.current / CHART_CONSTANTS.DRAG_THRESHOLD
        );
        const moveIndexCount = -steps;

        if (moveIndexCount !== 0) {
          const current = windowRange || [0, data.length - 1];
          const [start, end] = current;
          const windowSize = end - start;
          const maxIndex = data.length - 1;

          let newStart = start + moveIndexCount;
          let newEnd = end + moveIndexCount;

          if (newStart < 0) {
            newStart = 0;
            newEnd = windowSize;
          }
          if (newEnd > maxIndex) {
            newEnd = maxIndex;
            newStart = maxIndex - windowSize;
          }

          const newWindow: [number, number] = [newStart, newEnd];

          if (onWindowChange) {
            onWindowChange(newWindow);
          } else {
            setInternalWindow(newWindow);
          }

          dragAccumulator.current -= steps * CHART_CONSTANTS.DRAG_THRESHOLD;
        }
      }
    },
    [enablePan, isDragging, windowRange, data.length, onWindowChange]
  );

  const handleMouseUp = useCallback(() => {
    if (controlledIsDragging === undefined) {
      setInternalIsDragging(false);
    }
    dragAccumulator.current = 0;
  }, [controlledIsDragging]);

  return (
    <div
      ref={chartContainerRef}
      className={className}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        cursor: enablePan ? (isDragging ? "grabbing" : "grab") : "default",
        touchAction: "none",
      }}
    >
      <ResponsiveContainer
        width="100%"
        height={CHART_CONSTANTS.HEIGHT}
        debounce={CHART_CONSTANTS.RESIZE_DEBOUNCE}
      >
        <ComposedChart data={indexedData} margin={stableProps.chartMargin}>
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={CHART_CONSTANTS.COLORS.production}
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor={CHART_CONSTANTS.COLORS.production}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />

          <XAxis {...stableProps.xAxisProps} />
          <YAxis {...stableProps.yAxisLeftProps} />
          <YAxis {...stableProps.yAxisRightProps} />

          <Tooltip {...stableProps.tooltipProps} />
          <Legend {...stableProps.legendProps} />

          {/* 🧩 動態渲染器 */}
          <Renderer
            data={indexedData}
            isDragging={isDragging}
            colors={CHART_CONSTANTS.COLORS}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
