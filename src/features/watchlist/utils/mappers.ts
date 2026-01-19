import type { Equipment } from "@/features/equipment/types";
import type { WatchlistItem } from "../types";

/**
 * 將 Equipment 轉換為 WatchlistItem
 * 🧠 Status 需轉小寫 (Normal -> normal)
 */
export function equipmentToWatchlistItem(
  equipment: Equipment
): WatchlistItem {
  return {
    id: equipment.id,
    name: equipment.machine,
    status: equipment.status.toLowerCase() as "normal" | "warning" | "error",
    temperature: equipment.temperature,
    rpm: equipment.rpm,
    timestamp: equipment.timestamp,
  };
}
