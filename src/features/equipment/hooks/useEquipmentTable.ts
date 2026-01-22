import { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
  type ColumnDef,
} from "@tanstack/react-table";
import { usePerformanceStore } from "@/stores/usePerformanceStore";
import type { Equipment } from "../types";

//! =============== Hook Props 定義 ===============

interface UseEquipmentTableProps {
  data: Equipment[];
  columns: ColumnDef<Equipment, any>[];
}

//! =============== Hook 實作 ===============

/**
 * Equipment Table 邏輯 Hook
 * @description 封裝 TanStack Table 的完整邏輯 (篩選、排序、狀態管理)
 *
 * 🧠 設計決策:
 * - 使用 TanStack Table v8 headless 邏輯
 * - 記錄 Table Processing Time 到 Performance Store
 * - 支援 Global Filter + Column Filter
 *
 * 💡 效能監控:
 * - 監聽 sorting 和 columnFilters 變化
 * - 計算篩選+排序的執行時間並記錄到 PerformanceStore
 *
 * @param {UseEquipmentTableProps} props - Hook 參數
 * @returns {Object} Table 實例與狀態控制函數
 *
 * @example
 * const { table, globalFilter, setGlobalFilter } = useEquipmentTable({
 *   data: equipments,
 *   columns: columnDefs,
 * });
 */
export function useEquipmentTable({ data, columns }: UseEquipmentTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const recordMetric = usePerformanceStore((state) => state.recordMetric);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getRowId: (row) => row.id, // 🧠 使用穩定的 ID，防止虛擬化捲動時選取遺失
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // 💡 效能監控: 記錄 Table Processing Time
  useEffect(() => {
    if (data.length === 0) return;

    const start = performance.now();

    // 觸發篩選和排序計算
    table.getFilteredRowModel();
    table.getSortedRowModel();

    const duration = performance.now() - start;

    // 只在有篩選或排序時記錄 (避免雜訊)
    if (sorting.length > 0 || columnFilters.length > 0 || globalFilter) {
      recordMetric("Table Processing Time", duration);
    }
  }, [sorting, columnFilters, globalFilter, data.length, table, recordMetric]);

  return {
    table,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    rowSelection,
    setRowSelection,
  };
}
