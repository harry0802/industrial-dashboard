/**
 * Equipment Feature
 *
 * Feature 層組裝: 整合 hooks + Compound Components
 */
import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EquipmentTable } from "@/components/equipment-table";
import { usePerformanceStore } from "@/stores/usePerformanceStore";
import { useEquipmentData } from "./hooks/useEquipmentData";
import { useEquipmentTable } from "./hooks/useEquipmentTable";
import { useEquipmentColumns } from "./components/EquipmentTableColumns";
import { exportEquipmentToCSV } from "./utils/csvExport";

//! =============== Constants ===============

const TABLE_HEIGHT = 300;

//! =============== Component ===============

export function EquipmentFeature() {
  const recordMetric = usePerformanceStore((s) => s.recordMetric);

  // 1. 資料獲取 (已經過 Zod 驗證)
  const { data, isLoading, error } = useEquipmentData();

  // 2. 欄位定義
  const columns = useEquipmentColumns();

  // 3. 表格邏輯
  const { table } = useEquipmentTable({ data: data || [], columns });

  // 4. 效能監控: Table Render Time
  useEffect(() => {
    if (data && data.length > 0) {
      const start = performance.now();
      requestAnimationFrame(() => {
        recordMetric("Table Render Time", performance.now() - start);
      });
    }
  }, [data, recordMetric]);

  // 5. CSV 匯出
  const handleExportCSV = () => {
    const rows = table.getRowModel().rows;
    exportEquipmentToCSV(rows.map((r) => r.original));
  };

  // Loading State
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2 flex-1 max-w-xl">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 flex-1" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
          <div className="rounded-md border" style={{ height: TABLE_HEIGHT }}>
            <div className="flex border-b bg-muted/50 h-10 items-center px-2 gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-28" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex border-b h-12 items-center px-2 gap-4"
              >
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
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
    <EquipmentTable.Root table={table} onExportCSV={handleExportCSV}>
      <Card>
        <CardHeader>
          <CardTitle>
            Equipment Status ({table.getRowModel().rows.length} items)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <EquipmentTable.Toolbar />
          <EquipmentTable.Content height={TABLE_HEIGHT} />
        </CardContent>
      </Card>
    </EquipmentTable.Root>
  );
}
