/**
 * =====================================
 * 🔍 useScopedSearch Hook - 範圍搜尋邏輯
 * =====================================
 * 管理搜尋範圍 (All/ID/Machine/Status) 與過濾邏輯
 */

import { useState, useCallback } from "react";
import type { Table } from "@tanstack/react-table";
import type { Equipment, SearchScope } from "../types";

/**
 * Scoped Search Hook
 *
 * @description 提供範圍選擇與搜尋邏輯
 * - All: 使用 globalFilter 搜尋所有欄位
 * - ID/Machine/Status: 使用 columnFilter 搜尋特定欄位
 *
 * @returns {object} 搜尋狀態與控制函數
 *
 * @example
 * const { scope, setScope, searchValue, setSearchValue, applySearch } = useScopedSearch();
 *
 * useEffect(() => {
 *   applySearch(table);
 * }, [scope, searchValue, table, applySearch]);
 */
export function useScopedSearch() {
  const [scope, setScope] = useState<SearchScope>("all");
  const [searchValue, setSearchValue] = useState("");

  /**
   * 套用搜尋過濾
   *
   * 💡 設計決策:
   * - scope === 'all': 使用 globalFilter (搜尋所有欄位)
   * - scope === 'id' | 'machine' | 'status': 使用 columnFilter (搜尋特定欄位)
   * - 切換範圍時自動清除其他過濾器
   */
  const applySearch = useCallback(
    (table: Table<Equipment>) => {
      if (scope === "all") {
        // 全域搜尋: 使用 globalFilter
        table.setGlobalFilter(searchValue);

        // 清除欄位級過濾
        table.getColumn("id")?.setFilterValue(undefined);
        table.getColumn("machine")?.setFilterValue(undefined);
        table.getColumn("status")?.setFilterValue(undefined);
      } else {
        // 欄位級搜尋: 使用 columnFilter
        table.setGlobalFilter("");

        // 套用特定欄位過濾
        const targetColumn = table.getColumn(scope);
        targetColumn?.setFilterValue(searchValue || undefined);

        // 清除其他欄位過濾
        ["id", "machine", "status"].forEach((col) => {
          if (col !== scope) {
            table.getColumn(col)?.setFilterValue(undefined);
          }
        });
      }
    },
    [scope, searchValue]
  );

  return {
    scope,
    setScope,
    searchValue,
    setSearchValue,
    applySearch,
  };
}
