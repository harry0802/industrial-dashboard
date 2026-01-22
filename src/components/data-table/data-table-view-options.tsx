import { Settings2 } from "lucide-react";
import type { Table } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

//! =============== Props 定義 ===============

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

//! =============== 組件實作 ===============

/**
 * Data Table View Options
 * @description 欄位可見性控制組件
 *
 * @component
 *
 * 💡 功能:
 * - 列出所有可切換的欄位
 * - 允許使用者勾選/取消勾選來顯示/隱藏欄位
 * - 自動排除無法隱藏的欄位 (enableHiding: false)
 *
 * 🧠 設計決策:
 * - 使用 Settings2 圖示表示視圖設定
 * - 欄位名稱使用 column.id (若有 header 則顯示 header)
 * - 保持 Dropdown 開啟狀態直到使用者主動關閉
 *
 * @example
 * <DataTableViewOptions table={table} />
 */
export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
        >
          <Settings2 className="mr-2 h-4 w-4" />
          {t("equipment.toolbar.view")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-37.5">
        <DropdownMenuLabel>{t("equipment.toolbar.toggleColumns")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide()
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
