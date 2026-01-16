/**
 * =====================================
 * 🏭 EquipmentTable - 設備列表表格
 * =====================================
 * 顯示設備狀態、產能、良率資訊
 */

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

/**
 * @typedef {Object} EquipmentTableProps
 * @property {Equipment[]} equipments - 設備列表資料
 */
interface EquipmentTableProps {
  equipments: Equipment[];
}

/**
 * EquipmentTable 組件 - 設備列表表格
 *
 * @param props - 組件屬性
 * @param props.equipments - 設備資料陣列
 * @returns EquipmentTable 元素
 *
 * 🧠 設計決策:
 * - 使用 shadcn Table 元件保持一致性
 * - 狀態 Badge 使用顏色標示 (運行中/閒置/維護/錯誤)
 * - 良率使用條件顏色 (>98% 綠色, <95% 紅色)
 *
 * 💡 資料展示:
 * - ID -> Name -> Status -> Yield -> Output -> Location
 */
function EquipmentTable({ equipments }: EquipmentTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipment Status</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Yield</TableHead>
              <TableHead className="text-right">Output</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {equipments.map((equipment) => (
              <TableRow key={equipment.id}>
                <TableCell className="font-medium">{equipment.id}</TableCell>
                <TableCell>{equipment.name}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getEquipmentStatusColor(equipment.status)}
                  >
                    {getEquipmentStatusLabel(equipment.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={
                      equipment.yield >= 98
                        ? "text-green-600"
                        : equipment.yield >= 95
                        ? "text-yellow-600"
                        : "text-red-600"
                    }
                  >
                    {equipment.yield}%
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {equipment.output.toLocaleString()}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {equipment.location}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default EquipmentTable;
