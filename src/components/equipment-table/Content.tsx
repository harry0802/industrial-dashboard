/**
 * EquipmentTable.Content
 *
 * 虛擬化表格主體
 */
import { type ReactNode } from "react";
import { flexRender } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEquipmentTableContext } from "./context";

//! =============== Constants ===============

const ROW_HEIGHT = 48;

//! =============== Props ===============

export interface EquipmentTableContentProps {
  /** 表格容器高度 (px) */
  height?: number;
  /** 空狀態自訂內容 */
  emptySlot?: ReactNode;
}

//! =============== Component ===============

export function EquipmentTableContent({
  height = 300,
  emptySlot,
}: EquipmentTableContentProps) {
  const { table, virtualRows, totalHeight, containerRef, filteredCount } =
    useEquipmentTableContext();

  const { rows } = table.getRowModel();

  // 計算 padding
  const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalHeight - (virtualRows[virtualRows.length - 1]?.end || 0)
      : 0;

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto rounded-md border"
      style={{ height }}
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
                        header.getContext(),
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
              <td style={{ height: paddingTop }} />
            </tr>
          )}

          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];

            return (
              <TableRow key={row.id} style={{ height: ROW_HEIGHT }}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}

          {paddingBottom > 0 && (
            <tr>
              <td style={{ height: paddingBottom }} />
            </tr>
          )}
        </TableBody>
      </Table>

      {/* Empty State */}
      {filteredCount === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          {emptySlot || (
            <p className="text-sm text-muted-foreground">No equipment found</p>
          )}
        </div>
      )}
    </div>
  );
}
