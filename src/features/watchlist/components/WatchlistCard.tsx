import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Factory, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WatchlistItem } from "../types";

interface WatchlistCardProps {
  type: string; // 💡 機型名稱 (Stable Key)
  data?: WatchlistItem; // 💡 可能為空 (API 未回傳)
  onRemove: (type: string) => void;
  dragOverlay?: boolean; // 💡 當作為 DragOverlay 渲染時
}

function WatchlistCardComponent({ type, data, onRemove, dragOverlay = false }: WatchlistCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: type, // 🧠 使用機型名稱作為 Stable ID
    disabled: dragOverlay, // 🧠 Overlay 不需要 sortable 邏輯
  });

  const style = dragOverlay
    ? undefined // Overlay 不需要 transform
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      };

  const statusColor = data?.status === "error"
    ? "bg-red-500/10 text-red-500 border-red-500/20"
    : data?.status === "warning"
    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

  return (
    <div
      ref={dragOverlay ? undefined : setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-3 rounded-lg border bg-card p-2 shadow-sm transition-all h-14",
        dragOverlay
          ? "cursor-grabbing shadow-2xl scale-105 opacity-90" // ✨ 拖曳中樣式
          : "hover:shadow-md"
      )}
    >
      {/* 拖曳手柄 */}
      <div
        {...(dragOverlay ? {} : listeners)}
        {...(dragOverlay ? {} : attributes)}
        className={cn(
          "text-muted-foreground/30 hover:text-foreground flex items-center shrink-0",
          dragOverlay ? "cursor-grabbing" : "cursor-grab active:cursor-grabbing"
        )}
      >
        <GripVertical className="h-5 w-5" />
      </div>

      {/* 機型 Icon */}
      <Factory className="h-4 w-4 text-muted-foreground shrink-0" />

      {/* 機型名稱 */}
      <span className="font-semibold text-sm truncate min-w-0">
        {type}
      </span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* 數值 Badges */}
      {data ? (
        <>
          <Badge
            variant="outline"
            className={cn(
              "flex shrink-0 items-center gap-1 font-mono text-xs",
              statusColor
            )}
          >
            <span className="font-bold">{data.temperature.toFixed(1)}</span>
            <span className="text-[10px] opacity-70">°C</span>
          </Badge>

          <Badge
            variant="outline"
            className={cn(
              "flex shrink-0 items-center gap-1 font-mono text-xs",
              statusColor
            )}
          >
            <span className="font-bold">{data.rpm.toLocaleString()}</span>
            <span className="text-[10px] opacity-70">RPM</span>
          </Badge>
        </>
      ) : (
        <span className="text-xs text-muted-foreground shrink-0">No data</span>
      )}

      {/* Remove Button */}
      {!dragOverlay && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onRemove(type)}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

// ✨ 效能優化：使用 React.memo
export const WatchlistCard = React.memo(WatchlistCardComponent);
