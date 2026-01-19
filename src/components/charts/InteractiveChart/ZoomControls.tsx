import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInteractiveChart } from "./context";

// =====================================================================
// Type Definitions
// =====================================================================

interface ZoomControlsProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  className?: string;
}

// =====================================================================
// Main Component
// =====================================================================

export function ZoomControls({
  position = "top-right",
  className = "",
}: ZoomControlsProps) {
  const { zoomIn, zoomOut, resetZoom, enableZoom } = useInteractiveChart();

  if (!enableZoom) return null;

  const positionStyles = getPositionStyles(position);

  return (
    <div
      className={`absolute z-10 flex flex-col gap-1 ${positionStyles} ${className}`}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={zoomIn}
        title="放大 (Zoom In)"
        className="h-8 w-8 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={zoomOut}
        title="縮小 (Zoom Out)"
        className="h-8 w-8 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={resetZoom}
        title="重置縮放 (Reset Zoom)"
        className="h-8 w-8 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}

ZoomControls.displayName = "InteractiveChart.ZoomControls";

// =====================================================================
// Pure Functions: Styling
// =====================================================================

// 🧠 根據位置返回對應的 Tailwind 類名
function getPositionStyles(
  position: "top-right" | "top-left" | "bottom-right" | "bottom-left"
): string {
  const positions = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  return positions[position];
}
