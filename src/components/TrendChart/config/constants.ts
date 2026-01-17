export const CHART_CONSTANTS = {
  HEIGHT: 350,
  MIN_ZOOM_POINTS: 5,
  DRAG_THRESHOLD: 15,
  ZOOM_FACTOR: 0.05,
  RESIZE_DEBOUNCE: 300, // ResponsiveContainer resize 防抖延遲（毫秒）
  COLORS: {
    production: "#3b82f6",
    defect: "#ef4444",
    yield: "#10b981",
    utilization: "#8b5cf6",
  },
} as const;
