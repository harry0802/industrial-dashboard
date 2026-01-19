import {
  ChartProvider,
  type ChartDataPoint,
  useInteractiveChart,
} from "./context";

// =====================================================================
// Type Definitions
// =====================================================================

interface RootProps {
  data: ChartDataPoint[];
  children: React.ReactNode;
  enableZoom?: boolean;
  enablePan?: boolean;
  xDataKey?: string;
  exportFilename?: string;
  exportOptions?: {
    png?: { backgroundColor?: string; pixelRatio?: number };
    svg?: { backgroundColor?: string };
  };
}

// =====================================================================
// Internal Component: RootContent
// =====================================================================

// 💡 內部包裝元件：附加 containerRef 到 DOM
function RootContent({ children }: { children: React.ReactNode }) {
  const { containerRef } = useInteractiveChart();

  return <div ref={containerRef}>{children}</div>;
}

// =====================================================================
// Main Component: Root
// =====================================================================

export function Root({
  data,
  children,
  enableZoom = true,
  enablePan = true,
  xDataKey = "__index",
  exportFilename,
  exportOptions,
}: RootProps) {
  return (
    <ChartProvider
      data={data}
      enableZoom={enableZoom}
      enablePan={enablePan}
      xDataKey={xDataKey}
      exportFilename={exportFilename}
      exportOptions={exportOptions}
    >
      <RootContent>{children}</RootContent>
    </ChartProvider>
  );
}

Root.displayName = "InteractiveChart.Root";
