import { useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { flexRender } from "@tanstack/react-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePerformanceStore } from "@/stores/usePerformanceStore";
import { useEquipmentData } from "../hooks/useEquipmentData";
import { useEquipmentTable } from "../hooks/useEquipmentTable";
import { useEquipmentColumns } from "./EquipmentTableColumns";
import { EquipmentTableToolbar } from "./EquipmentTableToolbar";
import { exportEquipmentToCSV } from "../utils/csvExport";

//! =============== 設定與常量 ===============

const ROW_HEIGHT = 48; // 固定行高 (px)
const OVERSCAN = 10; // 預渲染行數
const TABLE_HEIGHT = 300; // 表格容器高度 (px)

//! =============== 主組件 ===============

/**
 * Equipment Data Grid - 主要組件
 * @component
 *
 * 🧠 架構設計:
 * - TanStack Query: 資料獲取與快取
 * - TanStack Table: 表格邏輯 (篩選/排序)
 * - TanStack Virtual: 虛擬化渲染 (效能優化)
 *
 * 💡 效能監控:
 * - API Time: Ky hooks 自動記錄
 * - Table Processing Time: useEquipmentTable 記錄
 * - Table Render Time: useEffect 記錄
 *
 * ⚡ 虛擬化:
 * - 固定行高 48px
 * - 預渲染 10 行
 * - Sticky Header
 *
 * @example
 * <EquipmentDataGrid />
 */
export function EquipmentDataGrid() {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const recordMetric = usePerformanceStore((state) => state.recordMetric);

  // 1️⃣ 資料獲取
  const { data, isLoading, error } = useEquipmentData();

  // 2️⃣ 欄位定義
  const columns = useEquipmentColumns();

  // 3️⃣ 表格邏輯
  const { table } = useEquipmentTable({
    data: data || [],
    columns,
  });

  // 4️⃣ 虛擬化設定
  const { rows } = table.getRowModel();
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalHeight = virtualizer.getTotalSize();

  // 計算 padding (確保虛擬化正確)
  const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalHeight - (virtualRows[virtualRows.length - 1]?.end || 0)
      : 0;

  // 5️⃣ 效能監控: Table Render Time
  useEffect(() => {
    if (data && data.length > 0) {
      const start = performance.now();
      // 等待下一個 frame (確保 DOM 已渲染)
      requestAnimationFrame(() => {
        const duration = performance.now() - start;
        recordMetric("Table Render Time", duration);
      });
    }
  }, [data, recordMetric]);

  // 6️⃣ CSV 匯出處理
  const handleExportCSV = () => {
    const filteredData = rows.map((row) => row.original);
    exportEquipmentToCSV(filteredData);
  };

  // Loading State
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Loading equipment data...
        </CardContent>
      </Card>
    );
  }

  // Error State
  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-red-600">
          Error loading equipment data: {(error as Error).message}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipment Status ({rows.length} items)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 工具列 */}
        <EquipmentTableToolbar table={table} onExportCSV={handleExportCSV} />

        {/* 虛擬化表格 */}
        <div
          ref={tableContainerRef}
          className="relative overflow-auto rounded-md border"
          style={{ height: `${TABLE_HEIGHT}px` }}
        >
          <Table>
            {/* Sticky Header */}
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            {/* Virtual Body */}
            <TableBody>
              {paddingTop > 0 && (
                <tr>
                  <td style={{ height: `${paddingTop}px` }} />
                </tr>
              )}

              {virtualRows.map((virtualRow) => {
                const row = rows[virtualRow.index];

                return (
                  <TableRow key={row.id} style={{ height: `${ROW_HEIGHT}px` }}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}

              {paddingBottom > 0 && (
                <tr>
                  <td style={{ height: `${paddingBottom}px` }} />
                </tr>
              )}
            </TableBody>
          </Table>

          {/* Empty State */}
          {rows.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                No equipment found
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
