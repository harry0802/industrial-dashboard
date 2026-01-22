/**
 * Chart.Root
 *
 * Context Provider + CSS Variables 注入
 * 包裝 ChartProvider 並處理 shadcn 風格的 CSS scoping
 */

import type { ReactNode } from "react";
import { ChartProvider, type ChartProviderProps } from "../context/ChartContext";
import { useChartData } from "../context/ChartContext";
import type { ChartConfig } from "../types";

//! =============== ChartStyle (CSS Variables) ===============

const THEMES = { light: "", dark: ".dark" } as const;

interface ChartStyleProps {
  id: string;
  config: ChartConfig;
}

function ChartStyle({ id, config }: ChartStyleProps) {
  const colorConfig = Object.entries(config).filter(
    ([, cfg]) => cfg.theme || cfg.color,
  );

  if (!colorConfig.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .filter(Boolean)
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
}

//! =============== Inner Root (需要 context) ===============

interface InnerRootProps {
  children: ReactNode;
  className?: string;
}

function InnerRoot({ children, className }: InnerRootProps) {
  const { chartId, config } = useChartData();

  return (
    <div data-chart={chartId} className={className}>
      <ChartStyle id={chartId} config={config} />
      {children}
    </div>
  );
}

//! =============== ChartRoot ===============

export interface ChartRootProps extends Omit<ChartProviderProps, "children"> {
  children: ReactNode;
  className?: string;
}

export function ChartRoot({
  children,
  className,
  ...providerProps
}: ChartRootProps) {
  return (
    <ChartProvider {...providerProps}>
      <InnerRoot className={className}>{children}</InnerRoot>
    </ChartProvider>
  );
}
