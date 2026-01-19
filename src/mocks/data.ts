/**
 * =====================================
 * 🎭 Mock Data - UI 原型假資料
 * =====================================
 * 提供完整的靜態假資料用於 UI/UX 開發測試
 * 所有資料結構符合真實 API 規格
 */

/**
 * =====================================
 * 📝 類型定義
 * =====================================
 */

/**
 * KPI 統計資料
 */
export interface StatMetric {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "stable";
  color: "green" | "red" | "yellow" | "blue" | "gray";
}

/**
 * 趨勢圖表資料點
 */
export interface ChartDataPoint {
  [key: string]: string | number;
  time: string;
  production: number;
  yield: number;
  efficiency: number;
  defectCount: number;
}

/**
 * 設備狀態
 */
export type EquipmentStatus = "running" | "idle" | "maintenance" | "error";

/**
 * 設備資料
 */
export interface Equipment {
  id: string;
  name: string;
  status: EquipmentStatus;
  yield: number;
  output: number;
  location: string;
}

/**
 * 監控清單項目
 */
export interface WatchlistItem {
  id: string;
  name: string;
  type: "temperature" | "speed" | "pressure" | "vibration";
  value: number;
  unit: string;
  status: "normal" | "warning" | "critical";
  lastUpdate: string;
}

/**
 * =====================================
 * 🎯 Top Metrics Cards (5 個 KPI)
 * =====================================
 */
export const mockStats: StatMetric[] = [
  {
    label: "Total Production",
    value: "12,847",
    change: "+12.5%",
    trend: "up",
    color: "blue",
  },
  {
    label: "Defect Rate",
    value: "2.3%",
    change: "-0.8%",
    trend: "down",
    color: "green",
  },
  {
    label: "Yield Rate",
    value: "97.7%",
    change: "+1.2%",
    trend: "up",
    color: "green",
  },
  {
    label: "Downtime",
    value: "45 min",
    change: "+15 min",
    trend: "up",
    color: "red",
  },
  {
    label: "Utilization",
    value: "84.5%",
    change: "-2.1%",
    trend: "down",
    color: "yellow",
  },
];

/**
 * =====================================
 * 📊 Trend Chart Data (24 小時)
 * =====================================
 */
export const mockChartData: ChartDataPoint[] = Array.from(
  { length: 24 },
  (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return {
      time: `${hour}:00`,
      production: Math.floor(Math.random() * 300 + 400), // 400-700
      yield: Math.floor(Math.random() * 5 + 95), // 95-100
      efficiency: Math.floor(Math.random() * 15 + 80), // 80-95
      defectCount: Math.floor(Math.random() * 40 + 10), // 10-50
    };
  }
);

/**
 * =====================================
 * 🏭 Equipment Table Data (10 筆)
 * =====================================
 */
export const mockEquipments: Equipment[] = [
  {
    id: "EQ-001",
    name: "CNC Machine A1",
    status: "running",
    yield: 98.5,
    output: 1247,
    location: "Building A - Floor 1",
  },
  {
    id: "EQ-002",
    name: "Injection Mold B2",
    status: "running",
    yield: 97.2,
    output: 2134,
    location: "Building B - Floor 2",
  },
  {
    id: "EQ-003",
    name: "Assembly Line C3",
    status: "idle",
    yield: 95.8,
    output: 0,
    location: "Building C - Floor 1",
  },
  {
    id: "EQ-004",
    name: "Stamping Press D4",
    status: "running",
    yield: 99.1,
    output: 3421,
    location: "Building D - Floor 3",
  },
  {
    id: "EQ-005",
    name: "Welding Robot E5",
    status: "maintenance",
    yield: 96.3,
    output: 0,
    location: "Building E - Floor 2",
  },
  {
    id: "EQ-006",
    name: "Laser Cutter F6",
    status: "running",
    yield: 98.9,
    output: 1876,
    location: "Building F - Floor 1",
  },
  {
    id: "EQ-007",
    name: "Paint Booth G7",
    status: "error",
    yield: 92.1,
    output: 0,
    location: "Building G - Floor 2",
  },
  {
    id: "EQ-008",
    name: "Packaging Line H8",
    status: "running",
    yield: 97.6,
    output: 2987,
    location: "Building H - Floor 1",
  },
  {
    id: "EQ-009",
    name: "Quality Inspection I9",
    status: "running",
    yield: 99.4,
    output: 1654,
    location: "Building I - Floor 3",
  },
  {
    id: "EQ-010",
    name: "Material Handler J10",
    status: "idle",
    yield: 94.7,
    output: 0,
    location: "Building J - Floor 1",
  },
];

/**
 * =====================================
 * 👁️ Watchlist Data (5 筆即時監控)
 * =====================================
 */
export const mockWatchlist: WatchlistItem[] = [
  {
    id: "W-001",
    name: "CNC Machine A1",
    type: "temperature",
    value: 65,
    unit: "°C",
    status: "normal",
    lastUpdate: "2 min ago",
  },
  {
    id: "W-002",
    name: "Injection Mold B2",
    type: "speed",
    value: 1850,
    unit: "RPM",
    status: "normal",
    lastUpdate: "1 min ago",
  },
  {
    id: "W-003",
    name: "Stamping Press D4",
    type: "pressure",
    value: 145,
    unit: "PSI",
    status: "warning",
    lastUpdate: "30 sec ago",
  },
  {
    id: "W-004",
    name: "Welding Robot E5",
    type: "temperature",
    value: 92,
    unit: "°C",
    status: "critical",
    lastUpdate: "5 min ago",
  },
  {
    id: "W-005",
    name: "Laser Cutter F6",
    type: "vibration",
    value: 3.2,
    unit: "mm/s",
    status: "normal",
    lastUpdate: "1 min ago",
  },
];

/**
 * =====================================
 * 🎨 UI Helper Functions
 * =====================================
 */

/**
 * 根據設備狀態返回顏色類別
 */
export function getEquipmentStatusColor(status: EquipmentStatus): string {
  const colorMap: Record<EquipmentStatus, string> = {
    running: "text-green-600 bg-green-500/10",
    idle: "text-yellow-600 bg-yellow-500/10",
    maintenance: "text-blue-600 bg-blue-500/10",
    error: "text-red-600 bg-red-500/10",
  };
  return colorMap[status];
}

/**
 * 根據設備狀態返回顯示文字
 */
export function getEquipmentStatusLabel(status: EquipmentStatus): string {
  const labelMap: Record<EquipmentStatus, string> = {
    running: "運行中",
    idle: "閒置",
    maintenance: "維護中",
    error: "錯誤",
  };
  return labelMap[status];
}

/**
 * 根據監控狀態返回顏色類別
 */
export function getWatchlistStatusColor(
  status: "normal" | "warning" | "critical"
): string {
  const colorMap = {
    normal: "text-green-600",
    warning: "text-yellow-600",
    critical: "text-red-600",
  };
  return colorMap[status];
}

/**
 * 根據趨勢返回圖示名稱 (Lucide React)
 */
export function getTrendIcon(trend: "up" | "down" | "stable"): string {
  const iconMap = {
    up: "TrendingUp",
    down: "TrendingDown",
    stable: "Minus",
  };
  return iconMap[trend];
}

/**
 * 根據顏色返回 Tailwind 類別
 */
export function getColorClasses(
  color: "green" | "red" | "yellow" | "blue" | "gray"
): { text: string; bg: string } {
  const colorMap = {
    green: { text: "text-green-600", bg: "bg-green-500/10" },
    red: { text: "text-red-600", bg: "bg-red-500/10" },
    yellow: { text: "text-yellow-600", bg: "bg-yellow-500/10" },
    blue: { text: "text-blue-600", bg: "bg-blue-500/10" },
    gray: { text: "text-gray-600", bg: "bg-gray-500/10" },
  };
  return colorMap[color];
}
