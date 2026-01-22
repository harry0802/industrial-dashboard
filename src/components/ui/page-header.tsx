/**
 * =====================================
 * 📄 PageHeader 組件 - 頁面標題區塊
 * =====================================
 * 基於 shadcn 設計系統的頁面標題組件，提供一致的標題樣式
 */

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * @typedef {Object} PageHeaderProps
 * @property {string} title - 頁面主標題
 * @property {string} [description] - 頁面描述 (可選)
 * @property {React.ReactNode} [action] - 動作按鈕區域 (可選)
 * @property {string} [className] - 額外的 CSS 類別 (可選)
 */
interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/**
 * PageHeader 組件 - 頁面標題區塊
 *
 * @param {PageHeaderProps} props - 組件屬性
 * @returns {JSX.Element} PageHeader 元素
 *
 * @example
 * // 基本用法
 * <PageHeader
 *   title="Industrial Dashboard"
 *   description="Phase 1: 基礎建設 & 效能監控"
 * />
 *
 * @example
 * // 帶有動作按鈕
 * <PageHeader
 *   title="設備列表"
 *   description="共 10,000 筆設備資料"
 *   action={<Button>匯出 CSV</Button>}
 * />
 */
function PageHeader({
  title,
  description,
  action,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn("flex items-start justify-between gap-4", className)}
      {...props}
    >
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export { PageHeader };
export type { PageHeaderProps };
