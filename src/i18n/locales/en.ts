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
  },

  // Chart & Table Headers
  chart: {
    title: "Production Trend (24h)",
    production: "Production",
    yield: "Yield %",
    efficiency: "Efficiency %",
  },

  table: {
    equipment: "Equipment Status",
    id: "ID",
    name: "Name",
    status: "Status",
    yield: "Yield",
    output: "Output",
    location: "Location",
  },

  // Equipment Status
  status: {
    running: "Running",
    idle: "Idle",
    maintenance: "Maintenance",
    error: "Error",
  },

  // Watchlist
  watchlist: {
    title: "Watchlist Monitor",
    temperature: "Temperature",
    speed: "Speed",
    pressure: "Pressure",
    vibration: "Vibration",
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
  },
} as const;

export type Translations = typeof en;
