/**
 * EquipmentTable.Toolbar
 *
 * 消費 Context 的工具列，支援自訂 actions slot
 */
import { useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
      {/* 左側: Status Filter + Search */}
      <div className="flex flex-wrap gap-2 flex-1 sm:max-w-xl">
        <Select
          value={currentStatusFilter}
          onValueChange={(v) => setStatusFilter(v as EquipmentStatus | "all")}
        >
          <SelectTrigger className="w-[calc(50%-4px)] sm:w-28">
            <SelectValue placeholder={t("equipment.toolbar.allStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("equipment.toolbar.allStatus")}</SelectItem>
            <SelectItem value="Normal">{t("equipment.status.normal")}</SelectItem>
            <SelectItem value="Warning">{t("equipment.status.warning")}</SelectItem>
            <SelectItem value="Error">{t("equipment.status.error")}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={scope} onValueChange={(v) => setScope(v as SearchScope)}>
          <SelectTrigger className="w-[calc(50%-4px)] sm:w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SEARCH_SCOPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder={t("equipment.toolbar.searchPlaceholder", { scope: t(`equipment.scopes.${scope}`) })}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="h-9 w-full sm:flex-1 sm:min-w-[120px]"
        />
      </div>

      {/* 右側: 控制按鈕 */}
      <div className="flex items-center gap-2 justify-end">
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <X className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t("equipment.toolbar.reset")}</span>
          </Button>
        )}

        <DataTableViewOptions table={table} />

        {!hideExport && (
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t("equipment.toolbar.exportCsv")}</span>
          </Button>
        )}

        {actions}
      </div>
    </div>
  );
}
