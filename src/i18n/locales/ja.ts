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
    language: "言語",
    darkMode: "ダークモード",
    lightMode: "ライトモード",
  },

  // KPI Metrics
  kpi: {
    production: "総生産量",
    defect: "不良率",
    yield: "歩留まり",
    downtime: "ダウンタイム",
    utilization: "稼働率",
    // Metric labels (matching API keys)
    metrics: {
      productionOutput: "生産出力",
      defectCount: "不良品数",
      yieldRate: "歩留まり",
      downtimeAlerts: "停止アラート",
      utilizationRate: "稼働率",
    },
    // Unit translations
    units: {
      units: "個",
      defects: "件",
      alerts: "回",
    },
    // Trend descriptions
    trend: {
      vsLastHour: "前時比",
      up: "今期は上昇傾向",
      down: "今期は下降傾向",
      stable: "今期は安定",
    },
    // Messages
    messages: {
      loadError: "KPIデータを読み込めません",
      unknownError: "不明なエラーが発生しました",
    },
  },

  // Chart
  chart: {
    title: "生産トレンド (24時間)",
    production: "生産量",
    yield: "歩留まり %",
    efficiency: "効率 %",
    // Series labels (matching CHART_CONFIG keys)
    series: {
      production: "生産量 (個)",
      defectCount: "不良品 (個)",
      downtime: "停止 (回)",
      yield: "歩留まり (%)",
      efficiency: "稼働率 (%)",
    },
    // Chart modes
    modes: {
      line: "折れ線グラフ",
      area: "面グラフ",
      bar: "棒グラフ",
    },
    // Actions
    actions: {
      export: "エクスポート",
      exportPng: "PNG エクスポート",
      exportSvg: "SVG エクスポート",
      retry: "再試行",
      resetZoom: "ズームリセット",
    },
    // Messages
    messages: {
      loadError: "チャートデータを読み込めません",
      unknownError: "不明なエラーが発生しました",
      noData: "チャートデータがありません",
      analysisTitle: "生産トレンド分析",
    },
    // Axis labels
    axis: {
      count: "個",
      percentage: "%",
    },
  },

  // Table Headers
  table: {
    equipment: "設備ステータス",
    id: "ID",
    name: "名前",
    status: "ステータス",
    yield: "歩留まり",
    output: "出力",
    location: "場所",
  },

  // Equipment Status (legacy)
  status: {
    running: "稼働中",
    idle: "待機中",
    maintenance: "メンテナンス中",
    error: "エラー",
  },

  // Equipment Module
  equipment: {
    title: "設備ステータス",
    // Column headers
    columns: {
      id: "ID",
      machine: "装置名",
      status: "ステータス",
      temperature: "温度 (°C)",
      rpm: "回転数",
      timestamp: "最終更新",
    },
    // Status values
    status: {
      normal: "正常",
      warning: "警告",
      error: "エラー",
    },
    // Search scopes
    scopes: {
      all: "全フィールド",
      id: "ID",
      machine: "装置",
      status: "ステータス",
    },
    // Toolbar
    toolbar: {
      searchPlaceholder: "{{scope}}を検索...",
      filterStatus: "ステータスで絞り込み",
      allStatus: "全ステータス",
      exportCsv: "CSV エクスポート",
      refresh: "更新",
      reset: "リセット",
      view: "表示",
      toggleColumns: "列の切り替え",
    },
    // Messages
    messages: {
      noData: "設備データなし",
      loading: "設備を読み込み中...",
      loadError: "設備データの読み込みエラー",
      itemCount: "{{count}} 件",
    },
  },

  // Watchlist
  watchlist: {
    title: "監視リスト",
    temperature: "温度",
    speed: "速度",
    pressure: "圧力",
    vibration: "振動",
    // Badge
    badge: "{{seconds}}秒更新",
    // Actions
    actions: {
      addMachine: "機種を追加",
      searchPlaceholder: "機種を検索...",
      notFound: "機種が見つかりません。",
    },
    // Card
    card: {
      noData: "データなし",
      units: {
        rpm: "RPM",
      },
    },
    // Messages
    messages: {
      loading: "データを読み込み中...",
      empty: "監視リストは空です。上のドロップダウンから機種を追加してください。",
    },
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
    // Metric labels
    metrics: {
      kpiApi: "KPI API 時間",
      equipmentApi: "設備 API 時間",
      chartApi: "チャート API 時間",
      watchlistApi: "監視リスト API 時間",
      tableRender: "テーブル描画時間",
      tableProcess: "テーブル処理時間",
      chartRender: "チャート描画時間",
      pageLoad: "総ページ読み込み時間",
    },
    // Units
    units: {
      ms: "ミリ秒",
      metricsCount: "{{count}} 指標",
    },
  },
} as const;
