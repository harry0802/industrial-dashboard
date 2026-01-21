/**
 * EquipmentTable.Toolbar
 *
 * 消費 Context 的工具列，支援自訂 actions slot
 */
import { useEffect, type ReactNode } from "react";
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
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { useEquipmentTableContext } from "./context";
import { useScopedSearch } from "@/features/equipment/hooks/useScopedSearch";
import {
  SEARCH_SCOPE_OPTIONS,
  type EquipmentStatus,
  type SearchScope,
} from "@/features/equipment/types";

//! =============== Props ===============

export interface EquipmentTableToolbarProps {
  /** 自訂右側 slot */
  actions?: ReactNode;
  /** 隱藏匯出按鈕 */
  hideExport?: boolean;
}

//! =============== Component ===============

export function EquipmentTableToolbar({
  actions,
  hideExport = false,
}: EquipmentTableToolbarProps) {
  const { table, exportCSV } = useEquipmentTableContext();
  const statusColumn = table.getColumn("status");

  const { scope, setScope, searchValue, setSearchValue, applySearch } =
    useScopedSearch();

  useEffect(() => {
    applySearch(table);
  }, [scope, searchValue, table, applySearch]);

  const currentStatusFilter =
    (statusColumn?.getFilterValue() as EquipmentStatus | undefined) || "all";

  const setStatusFilter = (status: EquipmentStatus | "all") => {
    if (status === "all") {
      statusColumn?.setFilterValue(undefined);
    } else {
      statusColumn?.setFilterValue(status);
    }
  };

  const hasActiveFilters =
    table.getState().columnFilters.length > 0 ||
    searchValue ||
    table.getState().sorting.length > 0 ||
    table.getAllColumns().some((column) => !column.getIsVisible());

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

        <Select value={scope} onValueChange={(v) => setScope(v as SearchScope)}>
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
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <X className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}

        <DataTableViewOptions table={table} />

        {!hideExport && (
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}

        {actions}
      </div>
    </div>
  );
}
