import React from "react";
import { useTranslation } from "react-i18next";
import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { Equipment } from "../types";

const columnHelper = createColumnHelper<Equipment>();

//! =============== 表格欄位定義 Hook ===============

/**
 * Equipment 表格欄位定義
 * @description 定義表格的所有欄位配置
 *
 * 💡 使用 useMemo 確保引用穩定 (效能關鍵)
 * 🧠 欄位順序: ID -> Machine -> Status -> Temperature -> RPM -> Timestamp
 * ✨ 移除 Checkbox 欄位 (改為單選操作)
 *
 * @returns {ColumnDef<Equipment>[]} TanStack Table 欄位定義
 */
export function useEquipmentColumns() {
  const { t } = useTranslation();

  return React.useMemo(
    () => [
      // 1. ID
      columnHelper.accessor("id", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("equipment.columns.id")} />
        ),
        size: 100,
        cell: (info) => {
          const id = info.getValue();
          return <span className="font-mono">{id}</span>;
        },
      }),

      // 2. Machine
      columnHelper.accessor("machine", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("equipment.columns.machine")} />
        ),
        size: 200,
      }),

      // 3. Status
      columnHelper.accessor("status", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("equipment.columns.status")} />
        ),
        size: 120,
        cell: (info) => {
          const status = info.getValue();
          const colorMap = {
            Normal: "text-green-600 bg-green-500/10",
            Warning: "text-yellow-600 bg-yellow-500/10",
            Error: "text-red-600 bg-red-500/10",
          };
          return (
            <Badge variant="outline" className={colorMap[status]}>
              {t(`equipment.status.${status.toLowerCase()}`)}
            </Badge>
          );
        },
        filterFn: "equals", // 單選篩選
      }),

      // 4. Temperature
      columnHelper.accessor("temperature", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("equipment.columns.temperature")} />
        ),
        size: 120,
        cell: (info) => (
          <span className="font-mono">{info.getValue().toFixed(1)}</span>
        ),
      }),

      // 5. RPM
      columnHelper.accessor("rpm", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("equipment.columns.rpm")} />
        ),
        size: 120,
        cell: (info) => (
          <span className="font-mono">{info.getValue().toLocaleString()}</span>
        ),
      }),

      // 6. Timestamp
      columnHelper.accessor("timestamp", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("equipment.columns.timestamp")} />
        ),
        size: 180,
        cell: (info) => {
          const date = new Date(info.getValue());
          return (
            <span className="text-xs text-muted-foreground">
              {date.toLocaleString()}
            </span>
          );
        },
      }),
    ],
    [t],
  );
}
