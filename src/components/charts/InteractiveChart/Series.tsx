import type { SeriesConfig } from "./context";

// 💡 這是一個配置組件，不渲染任何 DOM
// Canvas 會解析它的 props 來渲染對應的 Recharts 元件

export interface SeriesProps
  extends Omit<SeriesConfig, "type" | "color" | "dataKey"> {
  dataKey: string;
  type: "line" | "area" | "bar";
  color: string;
  name?: string;
  yAxisId?: "left" | "right";
  strokeWidth?: number;
  strokeDasharray?: string;
  fillOpacity?: number;

  // 💡 Advanced Recharts props (透傳)
  stackId?: string;
  label?: any;
  dot?: boolean | React.ReactElement;
  activeDot?: boolean | React.ReactElement;

  // 🔥 支援任意 props 透傳給 Recharts
  [key: string]: any;
}

export function Series(_props: SeriesProps): null {
  // 💡 不渲染任何內容，僅作為配置載體
  return null;
}

// 🧠 用於 Canvas 的型別檢查
Series.displayName = "InteractiveChart.Series";
