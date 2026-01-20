import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

//! =============== Props 定義 ===============

interface DataTableColumnHeaderProps<
  TData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

//! =============== 組件實作 ===============

/**
 * Data Table Column Header
 * @description 極簡化的表格欄位標題 - 直接點擊切換排序
 *
 * @component
 *
 * 💡 功能:
 * - 直接點擊切換排序狀態 (None -> Asc -> Desc -> None)
 * - 動態圖示顯示當前排序狀態
 * - 已排序時高亮顯示 (text-primary)
 *
 * 🧠 設計決策:
 * - 移除 Dropdown Menu，採用單次點擊循環切換
 * - 使用圖示直覺呈現排序方向
 * - Inactive 狀態 (未排序) 使用暗色圖示
 * - Active 狀態 (已排序) 使用主色調高亮
 *
 * 🎨 視覺狀態:
 * - None: ChevronsUpDown + text-muted-foreground
 * - Asc: ArrowUp + text-primary (高亮)
 * - Desc: ArrowDown + text-primary (高亮)
 *
 * @example
 * columnHelper.accessor('machine', {
 *   header: ({ column }) => (
 *     <DataTableColumnHeader column={column} title="Machine" />
 *   ),
 * })
 */
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const isSorted = column.getIsSorted();

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(isSorted === "asc")}
        className={cn(
          "-ml-3 h-8 hover:bg-accent",
          isSorted && "text-primary font-medium"
        )}
      >
        <span>{title}</span>
        {isSorted === "desc" ? (
          <ArrowDown className="ml-2 h-4 w-4" />
        ) : isSorted === "asc" ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ChevronsUpDown className="ml-2 h-4 w-4 text-muted-foreground opacity-50" />
        )}
      </Button>
    </div>
  );
}
