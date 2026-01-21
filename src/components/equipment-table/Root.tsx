/**
 * EquipmentTable.Root
 *
 * Context Provider + 虛擬化設定
 * 接收外部傳入的 table 實例，建立虛擬化 Context
 */
import { useRef, type ReactNode } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Table } from "@tanstack/react-table";
import type { Equipment } from "@/features/equipment/schemas";
import { EquipmentTableProvider } from "./context";

//! =============== Constants ===============

const ROW_HEIGHT = 48;
const OVERSCAN = 10;

//! =============== Props ===============

export interface EquipmentTableRootProps {
  /** TanStack Table 實例 */
  table: Table<Equipment>;
  /** CSV 匯出回調 */
  onExportCSV: () => void;
  children: ReactNode;
}

//! =============== Component ===============

export function EquipmentTableRoot({
  table,
  onExportCSV,
  children,
}: EquipmentTableRootProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { rows } = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalHeight = virtualizer.getTotalSize();

  const contextValue = {
    table,
    virtualizer,
    virtualRows,
    totalHeight,
    containerRef,
    exportCSV: onExportCSV,
    filteredCount: rows.length,
  };

  return (
    <EquipmentTableProvider value={contextValue}>
      {children}
    </EquipmentTableProvider>
  );
}
