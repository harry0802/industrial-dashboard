import { BarChart3, LineChart, AreaChart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTrendChart } from "../../context";
import type { ChartType } from "../../core/types";

interface TypeSelectorProps {
  className?: string;
}

const CHART_TYPES = [
  { type: "area" as ChartType, label: "Area Chart", Icon: AreaChart },
  { type: "line" as ChartType, label: "Line Chart", Icon: LineChart },
  { type: "bar" as ChartType, label: "Bar Chart", Icon: BarChart3 },
];

/**
 * 📊 TrendChart.TypeSelector - 圖表類型選擇器
 *
 * 獨立的下拉選單組件，可自由放置
 *
 * @example
 * ```tsx
 * <TrendChart.Root data={data}>
 *   <TrendChart.TypeSelector />
 * </TrendChart.Root>
 * ```
 */
export function TypeSelector({ className }: TypeSelectorProps) {
  const { chartType, setChartType } = useTrendChart();

  const currentType = CHART_TYPES.find((t) => t.type === chartType);
  const CurrentIcon = currentType?.Icon || AreaChart;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className={className}>
          <CurrentIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {CHART_TYPES.map(({ type, label, Icon }) => (
          <DropdownMenuItem
            key={type}
            onClick={() => setChartType(type)}
            className="gap-2"
          >
            <Icon className="size-4" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
