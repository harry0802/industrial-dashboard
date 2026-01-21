/**
 * Equipment Zod Schemas
 *
 * Single Source of Truth for API validation and TypeScript types
 */
import { z } from "zod";

//! =============== Equipment Status ===============

export const EquipmentStatusSchema = z.enum(["Normal", "Warning", "Error"]);

//! =============== Equipment Item ===============

export const EquipmentSchema = z.object({
  id: z.string(),
  machine: z.string(),
  status: EquipmentStatusSchema,
  temperature: z.number(),
  rpm: z.number(),
  timestamp: z.string(),
});

//! =============== API Response ===============

export const EquipmentListSchema = z.array(EquipmentSchema);

//! =============== Inferred Types (SSOT) ===============

export type Equipment = z.infer<typeof EquipmentSchema>;
export type EquipmentStatus = z.infer<typeof EquipmentStatusSchema>;
export type EquipmentList = z.infer<typeof EquipmentListSchema>;
