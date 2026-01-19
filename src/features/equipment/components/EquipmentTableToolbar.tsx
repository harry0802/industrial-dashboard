import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, X } from "lucide-react";
import type { Table } from "@tanstack/react-table";
import type { Equipment, EquipmentStatus, SearchScope } from "../types";
import { SEARCH_SCOPE_OPTIONS } from "../types";
import { useScopedSearch } from "../hooks/useScopedSearch";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";

//! =============== Props 定義 ===============

interface ToolbarProps {
  table: Table<Equipment>;
  onExportCSV: () => void;
}

//! =============== 組件實作 ===============

/**
 * Equipment Table Toolbar
 * @description 表格工具列 - Pure Query Mode (僅搜尋與過濾)
 *
 * @component
 *
 * 💡 功能:
 * - Status Filter: 下拉選單過濾設備狀態
 * - Scoped Search: 指定欄位搜尋
 * - View Options: 控制欄位顯示/隱藏
 * - Reset: 清除所有篩選和排序
 * - CSV 匯出
 *
 * 🧠 設計決策:
 * - 移除所有 Action 按鈕 (Add/Remove)
 * - 移除 Status Tabs，改用下拉選單
 * - 簡化為純查詢模式
 */
export function EquipmentTableToolbar({ table, onExportCSV }: ToolbarProps) {
  const statusColumn = table.getColumn("status");

  // 💡 使用 Scoped Search Hook
  const { scope, setScope, searchValue, setSearchValue, applySearch } =
    useScopedSearch();

  // 套用搜尋過濾 (當 scope 或 searchValue 變化時)
  useEffect(() => {
    applySearch(table);
  }, [scope, searchValue, table, applySearch]);

  // 取得當前狀態過濾
  const currentStatusFilter =
    (statusColumn?.getFilterValue() as EquipmentStatus | undefined) || "all";

  // 設定狀態過濾
  const setStatusFilter = (status: EquipmentStatus | "all") => {
    if (status === "all") {
      statusColumn?.setFilterValue(undefined);
    } else {
      statusColumn?.setFilterValue(status);
    }
  };

  // 檢查是否有活躍的篩選、排序或隱藏欄位
  const hasActiveFilters =
    table.getState().columnFilters.length > 0 ||
    searchValue ||
    table.getState().sorting.length > 0 ||
    table.getAllColumns().some((column) => !column.getIsVisible());

  // 重置所有狀態
  const handleReset = () => {
    table.resetSorting();
    table.resetColumnFilters();
    table.resetColumnVisibility();
    setSearchValue("");
    setScope("all");
  };

  return (
    <div className="flex items-center justify-between gap-2">
      {/* 左側: Status Filter + Search */}
      <div className="flex gap-2 flex-1 max-w-xl">
        {/* Status Filter Dropdown */}
        <Select
          value={currentStatusFilter}
          onValueChange={(v) => setStatusFilter(v as EquipmentStatus | "all")}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Normal">Normal</SelectItem>
            <SelectItem value="Warning">Warning</SelectItem>
            <SelectItem value="Error">Error</SelectItem>
          </SelectContent>
        </Select>

        {/* Scoped Search */}
        <Select
          value={scope}
          onValueChange={(v) => setScope(v as SearchScope)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SEARCH_SCOPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder={`Search ${scope === "all" ? "all fields" : scope}...`}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="h-9"
        />
      </div>

      {/* 右側: 控制按鈕 */}
      <div className="flex items-center gap-2">
        {/* Reset Button */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <X className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}

        {/* View Options */}
        <DataTableViewOptions table={table} />

        {/* Export CSV */}
        <Button variant="outline" size="sm" onClick={onExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
}
