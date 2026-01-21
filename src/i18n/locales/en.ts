/**
 * =====================================
 * 🌐 English (en) Translations
 * =====================================
 */

export const en = {
  // Navigation
  nav: {
    dashboard: "Dashboard",
    equipment: "Equipment",
    settings: "Settings",
  },

  // KPI Metrics
  kpi: {
    production: "Total Production",
    defect: "Defect Rate",
    yield: "Yield Rate",
    downtime: "Downtime",
    utilization: "Utilization",
    // Metric labels (matching API keys)
    metrics: {
      productionOutput: "Production Output",
      defectCount: "Defect Count",
      yieldRate: "Yield Rate",
      downtimeAlerts: "Downtime Alerts",
      utilizationRate: "Utilization Rate",
    },
    // Unit translations
    units: {
      units: "units",
      defects: "defects",
      alerts: "alerts",
    },
    // Trend descriptions
    trend: {
      vsLastHour: "vs last hour",
      up: "Trending up this period",
      down: "Trending down this period",
      stable: "Stable this period",
    },
    // Messages
    messages: {
      loadError: "Unable to load KPI data",
      unknownError: "An unknown error occurred",
    },
  },

  // Chart
  chart: {
    title: "Production Trend (24h)",
    production: "Production",
    yield: "Yield %",
    efficiency: "Efficiency %",
    // Series labels (matching CHART_CONFIG keys)
    series: {
      production: "Production (pcs)",
      defectCount: "Defects (pcs)",
      downtime: "Downtime (count)",
      yield: "Yield (%)",
      efficiency: "Efficiency (%)",
    },
    // Chart modes
    modes: {
      line: "Line Chart",
      area: "Area Chart",
      bar: "Bar Chart",
    },
    // Actions
    actions: {
      export: "Export",
      exportPng: "Export PNG",
      exportSvg: "Export SVG",
      retry: "Retry",
    },
    // Messages
    messages: {
      loadError: "Unable to load chart data",
      unknownError: "An unknown error occurred",
      noData: "No chart data available",
      analysisTitle: "Production Trend Analysis",
    },
    // Axis labels
    axis: {
      count: "pcs",
      percentage: "%",
    },
  },

  // Table Headers
  table: {
    equipment: "Equipment Status",
    id: "ID",
    name: "Name",
    status: "Status",
    yield: "Yield",
    output: "Output",
    location: "Location",
  },

  // Equipment Status (legacy)
  status: {
    running: "Running",
    idle: "Idle",
    maintenance: "Maintenance",
    error: "Error",
  },

  // Equipment Module
  equipment: {
    title: "Equipment Status",
    // Column headers
    columns: {
      id: "ID",
      machine: "Machine",
      status: "Status",
      temperature: "Temp (°C)",
      rpm: "RPM",
      timestamp: "Last Update",
    },
    // Status values
    status: {
      normal: "Normal",
      warning: "Warning",
      error: "Error",
    },
    // Search scopes
    scopes: {
      all: "All Fields",
      id: "ID",
      machine: "Machine",
      status: "Status",
    },
    // Toolbar
    toolbar: {
      searchPlaceholder: "Search {{scope}}...",
      filterStatus: "Filter by status",
      allStatus: "All Status",
      exportCsv: "Export CSV",
      refresh: "Refresh",
      reset: "Reset",
      view: "View",
      toggleColumns: "Toggle columns",
    },
    // Messages
    messages: {
      noData: "No equipment data",
      loading: "Loading equipment...",
      loadError: "Error loading equipment data",
      itemCount: "{{count}} items",
    },
  },

  // Watchlist
  watchlist: {
    title: "Watchlist Monitor",
    temperature: "Temperature",
    speed: "Speed",
    pressure: "Pressure",
    vibration: "Vibration",
    // Badge
    badge: "{{seconds}}s Polling",
    // Actions
    actions: {
      addMachine: "Add Machine Type",
      searchPlaceholder: "Search machine type...",
      notFound: "No machine type found.",
    },
    // Card
    card: {
      noData: "No data",
      units: {
        rpm: "RPM",
      },
    },
    // Messages
    messages: {
      loading: "Loading data...",
      empty: "No items in watchlist. Use the dropdown above to add machine types.",
    },
  },

  // Common
  common: {
    loading: "Loading...",
    error: "Error",
    retry: "Retry",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
  },

  // Performance Monitor
  performance: {
    title: "Performance Monitor",
    latency: "Latency",
    noData: "No monitoring data",
    // Metric labels
    metrics: {
      kpiApi: "KPI API Time",
      equipmentApi: "Equipment API Time",
      chartApi: "Chart API Time",
      tableRender: "Table Render Time",
      tableProcess: "Table Processing Time",
      chartRender: "Chart Render Time",
      pageLoad: "Total Page Render Time",
    },
    // Units
    units: {
      ms: "ms",
      metricsCount: "{{count}} Metrics",
    },
  },
} as const;

export type Translations = typeof en;
