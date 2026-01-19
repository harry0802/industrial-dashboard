/**
 * =====================================
 * 🌐 Japanese (ja) Translations
 * =====================================
 */

export const ja = {
  // Navigation
  nav: {
    dashboard: "ダッシュボード",
    equipment: "設備監視",
    settings: "設定",
  },

  // KPI Metrics
  kpi: {
    production: "総生産量",
    defect: "不良率",
    yield: "歩留まり",
    downtime: "ダウンタイム",
    utilization: "稼働率",
  },

  // Chart & Table Headers
  chart: {
    title: "生産トレンド (24時間)",
    production: "生産量",
    yield: "歩留まり %",
    efficiency: "効率 %",
  },

  table: {
    equipment: "設備ステータス",
    id: "ID",
    name: "名前",
    status: "ステータス",
    yield: "歩留まり",
    output: "出力",
    location: "場所",
  },

  // Equipment Status
  status: {
    running: "稼働中",
    idle: "待機中",
    maintenance: "メンテナンス中",
    error: "エラー",
  },

  // Watchlist
  watchlist: {
    title: "監視リスト",
    temperature: "温度",
    speed: "速度",
    pressure: "圧力",
    vibration: "振動",
  },

  // Common
  common: {
    loading: "読み込み中...",
    error: "エラー",
    retry: "再試行",
    save: "保存",
    cancel: "キャンセル",
    confirm: "確認",
  },

  // Performance Monitor
  performance: {
    title: "パフォーマンスモニター",
    latency: "レイテンシー",
    noData: "監視データなし",
  },
} as const;
