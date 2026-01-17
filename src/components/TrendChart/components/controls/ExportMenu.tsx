import { Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTrendChart } from "../../context";
import { exportChartAsImage } from "@/utils/chartExport";

interface ExportMenuProps {
  className?: string;
}

/**
 * 📥 TrendChart.ExportMenu - 匯出選單
 *
 * 提供 PNG/SVG 匯出功能
 *
 * @example
 * ```tsx
 * <TrendChart.Root data={data}>
 *   <TrendChart.ExportMenu />
 * </TrendChart.Root>
 * ```
 */
export function ExportMenu({ className }: ExportMenuProps) {
  const { chartRef } = useTrendChart();

  const handleExport = (format: "png" | "svg") => {
    if (!chartRef.current) return;

    exportChartAsImage(chartRef.current, "production-trend", format);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className={className}>
          <Download className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("png")} className="gap-2">
          <Download className="size-4" />
          Export as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("svg")} className="gap-2">
          <Download className="size-4" />
          Export as SVG
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
