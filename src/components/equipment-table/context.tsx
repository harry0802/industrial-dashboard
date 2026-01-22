/**
 * EquipmentTable Context
 *
 * 提供 table 實例和相關操作給所有子組件
 */
import { createContext, useContext, type ReactNode } from "react";
import type { Table } from "@tanstack/react-table";
import type { Virtualizer, VirtualItem } from "@tanstack/react-virtual";
import type { Equipment } from "@/features/equipment/schemas";

//! =============== Context Value Types ===============

export interface EquipmentTableContextValue {
  table: Table<Equipment>;
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  virtualRows: VirtualItem[];
  totalHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  exportCSV: () => void;
  filteredCount: number;
}

//! =============== Context Creation ===============

const EquipmentTableContext =
  createContext<EquipmentTableContextValue | null>(null);

//! =============== Context Hook ===============

export function useEquipmentTableContext(): EquipmentTableContextValue {
  const context = useContext(EquipmentTableContext);
  if (!context) {
    throw new Error(
      "useEquipmentTableContext must be used within <EquipmentTable.Root>",
    );
  }
  return context;
}

//! =============== Provider ===============

interface EquipmentTableProviderProps {
  value: EquipmentTableContextValue;
  children: ReactNode;
}

export function EquipmentTableProvider({
  value,
  children,
}: EquipmentTableProviderProps) {
  return (
    <EquipmentTableContext.Provider value={value}>
      {children}
    </EquipmentTableContext.Provider>
  );
}
