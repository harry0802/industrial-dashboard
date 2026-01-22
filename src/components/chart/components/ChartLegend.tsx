/**
 * Chart.Legend
 *
 * 可點擊切換的圖例
 * - 支援 enableToggle 控制是否可點擊
 * - 自動從 context 讀取 hiddenSeries
 */

import { useMemo, useCallback } from "react";
import { Legend } from "recharts";
import { useChartData, useChartInteraction } from "../context/ChartContext";
import { cn } from "@/lib/utils";

//! =============== Legend Content ===============

interface PayloadEntry {
  value: string;
  dataKey?: string | number;
  color?: string;
}

interface LegendContentProps {
  payload?: PayloadEntry[];
  hiddenSeries: Set<string>;
  onToggle?: (dataKey: string) => void;
  config: Record<string, { label?: React.ReactNode; color?: string }>;
}

function LegendContent({
  payload,
  hiddenSeries,
  onToggle,
  config,
}: LegendContentProps) {
  if (!payload?.length) return null;

  return (
    <div className="flex flex-wrap justify-center gap-4 pt-2">
      {payload.map((entry) => {
        const dataKey = String(entry.dataKey ?? entry.value);
        const isHidden = hiddenSeries.has(dataKey);
        const itemConfig = config[dataKey];

        return (
          <button
            key={dataKey}
            type="button"
            className={cn(
              "flex items-center gap-1.5 text-sm transition-opacity",
              onToggle ? "cursor-pointer hover:opacity-80" : "cursor-default",
              isHidden && "opacity-40",
            )}
            onClick={() => onToggle?.(dataKey)}
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className={cn(isHidden && "line-through")}>
              {typeof itemConfig?.label === 'string' ? itemConfig.label : entry.value}
            </span>
          </button>
        );
      })}
    </div>
  );
}

//! =============== Chart.Legend ===============

export interface ChartLegendProps {
  /** 是否可點擊切換 series 顯示 */
  enableToggle?: boolean;
  /** 垂直對齊 */
  verticalAlign?: "top" | "middle" | "bottom";
}

export function ChartLegend({
  enableToggle = true,
  verticalAlign = "bottom",
}: ChartLegendProps) {
  const { config } = useChartData();
  const { hiddenSeries, toggleSeries } = useChartInteraction();

  const handleToggle = useCallback(
    (dataKey: string) => {
      if (enableToggle) {
        toggleSeries(dataKey);
      }
    },
    [enableToggle, toggleSeries],
  );

  const content = useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (props: any) => (
        <LegendContent
          payload={props.payload as PayloadEntry[] | undefined}
          hiddenSeries={hiddenSeries}
          onToggle={enableToggle ? handleToggle : undefined}
          config={config}
        />
      ),
    [hiddenSeries, enableToggle, handleToggle, config],
  );

  return <Legend verticalAlign={verticalAlign} content={content} />;
}
