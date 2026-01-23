/**
 * Chart.ResetButton
 *
 * 獨立的重置按鈕
 * - 只有在 isZoomed 為 true 時渲染
 * - 可放在 Chart.Root 內的任意位置 (IoC)
 */

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChartInteraction } from "../context/ChartContext";
import { cn } from "@/lib/utils";

export interface ChartResetButtonProps {
  className?: string;
  /** 自訂內容，否則使用預設 icon + 文字 */
  children?: ReactNode;
  /** 變體 */
  variant?: "outline" | "ghost" | "secondary";
  /** 尺寸 */
  size?: "sm" | "default" | "lg";
}

export function ChartResetButton({
  className,
  children,
  variant = "outline",
  size = "sm",
}: ChartResetButtonProps) {
  const { t } = useTranslation();
  const { isZoomed, resetZoom } = useChartInteraction();

  // 非縮放狀態時不渲染
  if (!isZoomed) return null;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={resetZoom}
      className={cn("gap-1", className)}
    >
      {children ?? (
        <>
          <RotateCcw className="h-3.5 w-3.5" />
          {t("chart.actions.resetZoom")}
        </>
      )}
    </Button>
  );
}
