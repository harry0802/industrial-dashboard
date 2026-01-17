import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Equipment } from "@/mocks/data";
import { getEquipmentStatusColor, getEquipmentStatusLabel } from "@/mocks/data";

//! =============== 1. 設定與常量 ===============

//* 定義良率閾值與對應樣式，避免 Magic Number
const YIELD_THRESHOLDS = {
  HIGH: 98,
  MEDIUM: 95,
} as const;

//* 定義顏色樣式常量
const YIELD_STYLES = {
  HIGH: "text-green-600",
  MEDIUM: "text-yellow-600",
  LOW: "text-red-600",
} as const;

//! =============== 2. 類型與介面定義 ===============

/**
 * 設備表格 Props
 * @typedef {Object} EquipmentTableProps
 * @property {Equipment[]} equipments - 設備資料列表
 * @property {string} [className] - 可選樣式類名
 */
interface EquipmentTableProps {
  equipments: Equipment[];
  className?: string;
}

/**
 * 單一設備行 Props
 * @typedef {Object} EquipmentRowProps
 * @property {Equipment} equipment - 單一設備資料
 */
interface EquipmentRowProps {
  equipment: Equipment;
}

//! =============== 3. 核心功能實作 (Logic & Utils) ===============

/**
 * 取得良率顏色樣式 (純函數)
 * @description 實現 Push Ifs Up 原則，將條件判斷從 JSX 移出
 * @param {number} yieldValue - 良率數值
 * @returns {string} 對應的 Tailwind CSS class
 */
function getYieldColorClass(yieldValue: number): string {
  if (yieldValue >= YIELD_THRESHOLDS.HIGH) {
    return YIELD_STYLES.HIGH;
  }
  if (yieldValue >= YIELD_THRESHOLDS.MEDIUM) {
    return YIELD_STYLES.MEDIUM;
  }
  return YIELD_STYLES.LOW;
}

/**
 * 格式化數字 (純函數)
 * @param {number} value - 原始數值
 * @returns {string} 格式化後的字串
 */
function formatOutput(value: number): string {
  return value.toLocaleString();
}

//! =============== 4. 組件實作 (Component) ===============

/**
 * 設備列表行組件 (Sub-Component)
 * @description 負責渲染單一列，使用 React.memo 避免不必要的重繪
 */
const EquipmentRow = React.memo(function EquipmentRow({
  equipment,
}: EquipmentRowProps) {
  // 提取變數以保持 JSX 簡潔
  const yieldColor = getYieldColorClass(equipment.yield);
  const formattedOutput = formatOutput(equipment.output);
  const statusColor = getEquipmentStatusColor(equipment.status);
  const statusLabel = getEquipmentStatusLabel(equipment.status);

  return (
    <TableRow>
      <TableCell className="font-medium">{equipment.id}</TableCell>
      <TableCell>{equipment.name}</TableCell>
      <TableCell>
        <Badge variant="outline" className={statusColor}>
          {statusLabel}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <span className={yieldColor}>{equipment.yield}%</span>
      </TableCell>
      <TableCell className="text-right font-mono">{formattedOutput}</TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {equipment.location}
      </TableCell>
    </TableRow>
  );
});

// 設定 DisplayName 以利除錯
EquipmentRow.displayName = "EquipmentTable.Row";

/**
 * EquipmentTable 組件 - 設備列表表格
 * @component
 * @description 顯示設備狀態、產能、良率資訊
 */
function EquipmentTable({ equipments, className }: EquipmentTableProps) {
  //? 如果沒有資料，顯示 Empty State
  if (!equipments || equipments.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          No equipment data available.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Equipment Status</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Yield</TableHead>
              <TableHead className="text-right">Output</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* 🧠 Push Fors Down: 將迭代邏輯保留在父層，渲染邏輯下放給子組件 */}
            {equipments.map((equipment) => (
              <EquipmentRow key={equipment.id} equipment={equipment} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default EquipmentTable;
