import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTrendChart } from "../../context";

interface ResetButtonProps {
  className?: string;
}

/**
 * 🔄 TrendChart.ResetButton - 重置縮放按鈕
 *
 * 獨立組件，可在任何地方使用
 *
 * @example
 * ```tsx
 * <TrendChart.Root data={data}>
 *   <TrendChart.ResetButton />
 * </TrendChart.Root>
 * ```
 */
export function ResetButton({ className }: ResetButtonProps) {
  const { windowRange, resetZoom } = useTrendChart();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={resetZoom}
      disabled={!windowRange}
      className={className}
      title="Reset Zoom"
    >
      <RotateCcw className="size-4" />
    </Button>
  );
}
