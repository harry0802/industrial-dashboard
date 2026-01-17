import type { ComponentType } from "react";

/**
 * 📊 TrendChart 資料點型別
 *
 * 🎯 組件的資料契約 - 定義圖表接受的資料結構
 *
 * 設計原則：
 * - 組件應該定義自己的資料介面
 * - Mock 資料應該符合此型別，而非反過來依賴 mock
 * - 確保組件可在任何專案中重用
 */
export interface ChartDataPoint {
  time: string; // X 軸時間標籤 (例: "08:00", "2024-01-17")
  production: number; // 產量數值 (左軸，整數)
  yield: number; // 良率百分比 (右軸，0-100)
  efficiency: number; // 效率百分比 (右軸，0-100，在圖表中作為 utilization 顯示)
  defectCount: number; // 瑕疵數量 (左軸，整數)
}

export type ChartType = "area" | "line" | "bar";

export interface IndexedDataPoint extends ChartDataPoint {
  index: number;
}

// 渲染器 Props
export interface RendererProps {
  data: IndexedDataPoint[];
  isDragging: boolean;
  colors: {
    production: string;
    defect: string;
    yield: string;
    utilization: string;
  };
}

// 渲染器註冊表
export type ChartRenderer = ComponentType<RendererProps>;
export type ChartTypeRegistry = Record<string, ChartRenderer>;

// Canvas Props (支援受控/非受控)
export interface CanvasProps {
  // Required
  data: ChartDataPoint[];

  // Optional - 受控模式
  chartType?: ChartType | string;
  currentWindow?: [number, number];
  isDragging?: boolean;
  onWindowChange?: (window: [number, number]) => void;
  onChartTypeChange?: (type: ChartType) => void;

  // Optional - 非受控模式
  defaultChartType?: ChartType;
  defaultWindow?: [number, number];

  // Optional - 擴展
  renderersMap?: ChartTypeRegistry;
  className?: string;

  // Optional - 互動控制
  enableZoom?: boolean;
  enablePan?: boolean;
}
