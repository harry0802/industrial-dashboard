import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery } from "@tanstack/react-query";
import { GripVertical } from "lucide-react"; // 拖曳手柄圖標

// 引用既有的 UI 組件 (假設路徑)
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
// 假設的類型與圖標
import {
  Thermometer,
  Gauge,
  Wind,
  Waves,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";

//! =============== 1. 類型定義 ===============

export interface WatchlistItem {
  id: string;
  name: string;
  type: "temperature" | "speed" | "pressure" | "vibration";
  value: number;
  unit: string;
  status: "normal" | "warning" | "error";
}

const TYPE_ICONS: Record<string, LucideIcon> = {
  temperature: Thermometer,
  speed: Gauge,
  pressure: Wind,
  vibration: Waves,
};

//! =============== 2. 模擬 API 服務 (Service Layer) ===============

// 模擬 API 請求 (實際專案應移至 services/api.ts)
const fetchWatchlist = async (): Promise<WatchlistItem[]> => {
  // 模擬網路延遲
  await new Promise((resolve) => setTimeout(resolve, 300));

  // 模擬數據變化
  return [
    {
      id: "1",
      name: "Main Motor A",
      type: "speed",
      value: 1200 + Math.floor(Math.random() * 50),
      unit: "RPM",
      status: "normal",
    },
    {
      id: "2",
      name: "Hydraulic Pump",
      type: "pressure",
      value: 8.5 + Math.random(),
      unit: "Bar",
      status: Math.random() > 0.7 ? "warning" : "normal",
    },
    {
      id: "3",
      name: "Cooling System",
      type: "temperature",
      value: 65 + Math.floor(Math.random() * 10),
      unit: "°C",
      status: "normal",
    },
    {
      id: "4",
      name: "Axis X Vibration",
      type: "vibration",
      value: 2.1 + Math.random(),
      unit: "mm/s",
      status: Math.random() > 0.9 ? "error" : "normal",
    },
  ];
};

//! =============== 3. 業務邏輯 Hook (Business Logic) ===============

/**
 * 處理數據同步與排序邏輯
 */
function useWatchlistManager() {
  // 1. 初始化本地順序狀態 (Local State for Order)
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // 2. TanStack Query 進行 Polling (Source of Truth for Data)
  const { data: serverData } = useQuery({
    queryKey: ["watchlist"],
    queryFn: fetchWatchlist,
    refetchInterval: 3000, // ✨ 每 3 秒更新
    staleTime: 1000,
  });

  // 3. 智能合併策略 (Smart Merge Strategy)
  // 🧠 核心邏輯：當 Server 數據更新時，更新數值但保留本地排序
  useEffect(() => {
    if (!serverData) return;

    setItems((currentItems) => {
      // 如果是用戶第一次加載，直接使用 Server 順序
      if (currentItems.length === 0) return serverData;

      // 建立 Map 加速查找
      const serverDataMap = new Map(serverData.map((item) => [item.id, item]));

      // 策略 A: 保留當前列表的順序，只更新數值
      const mergedItems = currentItems.map((item) => {
        const freshData = serverDataMap.get(item.id);
        return freshData ? { ...freshData } : item; // 更新數值 或 保持舊值(若被刪除)
      });

      // 策略 B: 處理新增的項目 (Append 到最後)
      const currentIds = new Set(currentItems.map((i) => i.id));
      const newItems = serverData.filter((i) => !currentIds.has(i.id));

      return [...mergedItems, ...newItems];
    });
  }, [serverData]);

  // 4. DnD 感測器配置
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 5. 處理拖曳結束
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setIsDragging(false);
  }, []);

  const handleDragStart = useCallback(() => setIsDragging(true), []);

  return {
    items,
    sensors,
    handleDragEnd,
    handleDragStart,
    isDragging,
  };
}

//! =============== 4. 子組件 (Sub-Components) ===============

/**
 * 可排序的列表項目 (封裝 dnd-kit 邏輯)
 */
function SortableWatchlistItem({ item }: { item: WatchlistItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1, // 確保拖曳時層級較高
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-3 touch-none">
      <WatchlistItemRow
        item={item}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

/**
 * 純展示的列表行 (UI Component)
 * 分離 dragHandleProps 以便我們可以控制拖曳手柄的位置
 */
const WatchlistItemRow = React.memo(
  ({
    item,
    dragHandleProps,
  }: {
    item: WatchlistItem;
    dragHandleProps?: any;
  }) => {
    const Icon = TYPE_ICONS[item.type] || AlertCircle;
    const statusColor =
      item.status === "error"
        ? "bg-red-500/10 text-red-500 border-red-500/20"
        : item.status === "warning"
        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

    return (
      <div className="group flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md">
        {/* 拖曳手柄 */}
        <div
          {...dragHandleProps}
          className="cursor-grab text-muted-foreground/30 hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5" />
        </div>

        <Avatar className="h-9 w-9 shrink-0 border bg-background/50">
          <AvatarFallback className="bg-transparent">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="truncate text-sm font-medium leading-none">
            {item.name}
          </p>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {item.type}
          </span>
        </div>

        <Badge
          variant="outline"
          className={cn(
            "ml-auto flex shrink-0 items-center gap-1 font-mono",
            statusColor
          )}
        >
          <span className="font-bold">{item.value.toFixed(1)}</span>
          <span className="text-[10px] opacity-70">{item.unit}</span>
        </Badge>
      </div>
    );
  }
);
WatchlistItemRow.displayName = "WatchlistItemRow";

//! =============== 5. 主組件 (Main Component) ===============

export default function WatchlistPanel({ className }: { className?: string }) {
  const { items, sensors, handleDragEnd, handleDragStart } =
    useWatchlistManager();

  return (
    <Card className={cn("flex h-full flex-col", className)}>
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            Watchlist Monitor
            {/* 動態指示器：展示正在 Polling */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </CardTitle>
          <Badge variant="secondary" className="px-2 font-mono text-xs">
            3s Polling
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-full overflow-y-auto p-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items}
              strategy={verticalListSortingStrategy}
            >
              {items.map((item) => (
                <SortableWatchlistItem key={item.id} item={item} />
              ))}
            </SortableContext>
          </DndContext>

          {items.length === 0 && (
            <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
              Loading data...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
