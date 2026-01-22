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
    // Metric labels (matching API keys)
    metrics: {
      productionOutput: "生產總量",
      defectCount: "不良品數",
      yieldRate: "良率",
      downtimeAlerts: "停機警報",
      utilizationRate: "稼動率",
    },
    // Unit translations
    units: {
      units: "個",
      defects: "件",
      alerts: "次",
    },
    // Trend descriptions
    trend: {
      vsLastHour: "與上小時相比",
      up: "本期呈上升趨勢",
      down: "本期呈下降趨勢",
      stable: "本期維持穩定",
    },
    // Messages
    messages: {
      loadError: "無法載入 KPI 資料",
      unknownError: "發生未知錯誤",
    },
  },

  // Chart
  chart: {
    title: "產能趨勢 (24小時)",
    production: "生產量",
    yield: "良率 %",
    efficiency: "效率 %",
    // Series labels (matching CHART_CONFIG keys)
    series: {
      production: "產量 (pcs)",
      defectCount: "不良品 (pcs)",
      downtime: "停機 (次)",
      yield: "良率 (%)",
      efficiency: "稼動率 (%)",
    },
    // Chart modes
    modes: {
      line: "折線圖",
      area: "面積圖",
      bar: "長條圖",
    },
    // Actions
    actions: {
      export: "匯出",
      exportPng: "匯出 PNG",
      exportSvg: "匯出 SVG",
      retry: "重試",
    },
    // Messages
    messages: {
      loadError: "無法載入圖表資料",
      unknownError: "發生未知錯誤",
      noData: "目前沒有圖表資料",
      analysisTitle: "生產趨勢分析",
    },
    // Axis labels
    axis: {
      count: "pcs",
      percentage: "%",
    },
  },

  // Table Headers
  table: {
    equipment: "設備狀態",
    id: "編號",
    name: "名稱",
    status: "狀態",
    yield: "良率",
    output: "產量",
    location: "位置",
  },

  // Equipment Status (legacy)
  status: {
    running: "運行中",
    idle: "閒置",
    maintenance: "維護中",
    error: "錯誤",
  },

  // Equipment Module
  equipment: {
    title: "設備狀態",
    // Column headers
    columns: {
      id: "編號",
      machine: "機台名稱",
      status: "狀態",
      temperature: "溫度 (°C)",
      rpm: "轉速",
      timestamp: "最後更新",
    },
    // Status values
    status: {
      normal: "正常",
      warning: "警告",
      error: "異常",
    },
    // Search scopes
    scopes: {
      all: "所有欄位",
      id: "編號",
      machine: "機台",
      status: "狀態",
    },
    // Toolbar
    toolbar: {
      searchPlaceholder: "搜尋 {{scope}}...",
      filterStatus: "篩選狀態",
      allStatus: "所有狀態",
      exportCsv: "匯出 CSV",
      refresh: "重新整理",
      reset: "重設",
      view: "顯示欄位",
      toggleColumns: "切換欄位顯示",
    },
    // Messages
    messages: {
      noData: "無設備資料",
      loading: "載入設備中...",
      loadError: "載入設備資料時發生錯誤",
      itemCount: "{{count}} 筆",
    },
  },

  // Watchlist
  watchlist: {
    title: "監控清單",
    temperature: "溫度",
    speed: "轉速",
    pressure: "壓力",
    vibration: "震動",
    // Badge
    badge: "{{seconds}} 秒更新",
    // Actions
    actions: {
      addMachine: "新增監控機型",
      searchPlaceholder: "搜尋機型...",
      notFound: "找不到機型。",
    },
    // Card
    card: {
      noData: "無資料",
      units: {
        rpm: "RPM",
      },
    },
    // Messages
    messages: {
      loading: "載入資料中...",
      empty: "尚無監控項目，請使用上方選單加入機型。",
    },
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
    title: "系統效能監控",
    latency: "延遲",
    noData: "無效能資料",
    // Metric labels
    metrics: {
      kpiApi: "KPI API 耗時",
      equipmentApi: "設備 API 耗時",
      chartApi: "圖表 API 耗時",
      watchlistApi: "監控 API 耗時",
      tableRender: "表格渲染耗時",
      tableProcess: "表格處理耗時",
      chartRender: "圖表渲染耗時",
      pageLoad: "整頁載入時間",
    },
    // Units
    units: {
      ms: "毫秒",
      metricsCount: "{{count}} 個指標",
    },
  },
} as const;
