/**
 * Chart.Tooltip
 *
 * 封裝 Recharts Tooltip + shadcn 風格
 */

import { useMemo } from "react";
import { Tooltip } from "recharts";
import { useChartData } from "../context/ChartContext";
import type { TooltipProps } from "recharts";

//! =============== Tooltip Content ===============

interface PayloadItem {
  dataKey?: string | number;
  name?: string;
  value?: number;
  color?: string;
  payload?: Record<string, unknown>;
}

interface TooltipContentProps {
  active?: boolean;
  payload?: PayloadItem[];
  label?: string;
  config: Record<string, { label?: React.ReactNode; color?: string }>;
}

function TooltipContent({ active, payload, label, config }: TooltipContentProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
      {label && <div className="font-medium">{label}</div>}
      <div className="grid gap-1.5">
        {payload
          .filter((item) => item.value !== undefined)
          .map((item) => {
            const key = String(item.dataKey || item.name || "value");
            const itemConfig = config[key];

            return (
              <div
                key={key}
                className="flex w-full items-center justify-between gap-2"
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">
                    {typeof itemConfig?.label === 'string' ? itemConfig.label : item.name}
                  </span>
                </div>
                <span className="text-foreground font-mono font-medium tabular-nums">
                  {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

//! =============== Chart.Tooltip ===============

export interface ChartTooltipProps {
  /** 游標樣式 */
  cursor?: boolean | object;
  /** 指示器樣式 */
  indicator?: "dot" | "line" | "dashed";
}

export function ChartTooltip({
  cursor = false,
}: ChartTooltipProps) {
  const { config } = useChartData();

  const content = useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (props: TooltipProps<number, string>) => {
        const { active, payload, label } = props;
        return (
          <TooltipContent
            active={active}
            payload={payload as PayloadItem[] | undefined}
            label={label}
            config={config}
          />
        );
      },
    [config],
  );

  return <Tooltip cursor={cursor} content={content} />;
}
