/**
 * =====================================
 * 🌐 Traditional Chinese (zh-TW) Translations
 * =====================================
 */

export const zhTW = {
  // Navigation
  nav: {
    dashboard: "儀表板",
    equipment: "設備監控",
    settings: "系統設定",
  },

  // KPI Metrics
  kpi: {
    production: "生產總量",
    defect: "瑕疵率",
    yield: "良率",
    downtime: "停機時間",
    utilization: "使用率",
  },

  // Chart & Table Headers
  chart: {
    title: "產能趨勢 (24小時)",
    production: "生產量",
    yield: "良率 %",
    efficiency: "效率 %",
  },

  table: {
    equipment: "設備狀態",
    id: "編號",
    name: "名稱",
    status: "狀態",
    yield: "良率",
    output: "產量",
    location: "位置",
  },

  // Equipment Status
  status: {
    running: "運行中",
    idle: "閒置",
    maintenance: "維護中",
    error: "錯誤",
  },

  // Watchlist
  watchlist: {
    title: "監控清單",
    temperature: "溫度",
    speed: "轉速",
    pressure: "壓力",
    vibration: "震動",
  },

  // Common
  common: {
    loading: "載入中...",
    error: "錯誤",
    retry: "重試",
    save: "儲存",
    cancel: "取消",
    confirm: "確認",
  },

  // Performance Monitor
  performance: {
    title: "效能監控",
    latency: "延遲",
    noData: "無監控數據",
  },
} as const;
