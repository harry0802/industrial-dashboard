/**
 * EquipmentTable Compound Component
 *
 * @example
 * <EquipmentTable.Root table={table} onExportCSV={handleExport}>
 *   <Card>
 *     <CardHeader>
 *       <CardTitle>Equipment Status</CardTitle>
 *     </CardHeader>
 *     <CardContent className="space-y-4">
 *       <EquipmentTable.Toolbar />
 *       <EquipmentTable.Content height={400} />
 *     </CardContent>
 *   </Card>
 * </EquipmentTable.Root>
 */

import { EquipmentTableRoot } from "./Root";
import { EquipmentTableToolbar } from "./Toolbar";
import { EquipmentTableContent } from "./Content";

// Namespace export
export const EquipmentTable = {
  Root: EquipmentTableRoot,
  Toolbar: EquipmentTableToolbar,
  Content: EquipmentTableContent,
};

// Named exports
export { EquipmentTableRoot, EquipmentTableToolbar, EquipmentTableContent };

// Context hooks (for advanced usage)
export { useEquipmentTableContext } from "./context";

// Types
export type { EquipmentTableRootProps } from "./Root";
export type { EquipmentTableToolbarProps } from "./Toolbar";
export type { EquipmentTableContentProps } from "./Content";
