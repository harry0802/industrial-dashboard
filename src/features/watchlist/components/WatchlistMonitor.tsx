import { useCallback, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWatchlistStore } from "@/stores/useWatchlistStore";
import { useWatchlistData } from "../hooks/useWatchlistData";
import { useEquipmentData } from "@/features/equipment/hooks/useEquipmentData";
import { WatchlistCard } from "./WatchlistCard";

export default function WatchlistMonitor({
  className,
}: {
  className?: string;
}) {
  const { t } = useTranslation();

  // 1️⃣ Store Actions
  const watchedTypes = useWatchlistStore((state) => state.watchedTypes);
  const addType = useWatchlistStore((state) => state.addType);
  const removeType = useWatchlistStore((state) => state.removeType);
  const setTypes = useWatchlistStore((state) => state.setTypes);

  // 2️⃣ 取得所有設備資料並萃取唯一機型
  const { data: allEquipment = [] } = useEquipmentData();
  const availableTypes = useMemo(() => {
    if (!allEquipment || allEquipment.length === 0) return [];
    return Array.from(new Set(allEquipment.map((e) => e.machine))).sort();
  }, [allEquipment]);

  // 3️⃣ API 資料獲取 (已按 Store 順序排序)
  const { data: items = [], isLoading } = useWatchlistData();

  // 4️⃣ Combobox 狀態
  const [comboboxOpen, setComboboxOpen] = useState(false);

  // 5️⃣ 拖曳狀態 (用於 Portal)
  const [activeType, setActiveType] = useState<string | null>(null);

  // 6️⃣ DnD Sensor 設定
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  // 7️⃣ 拖曳開始
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveType(event.active.id as string);
  }, []);

  // 8️⃣ 拖曳結束
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveType(null); // 清除 Overlay

      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const oldIndex = watchedTypes.indexOf(active.id as string);
      const newIndex = watchedTypes.indexOf(over.id as string);

      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = arrayMove(watchedTypes, oldIndex, newIndex);
      setTypes(newOrder);
    },
    [watchedTypes, setTypes],
  );

  // 9️⃣ 拖曳取消
  const handleDragCancel = useCallback(() => {
    setActiveType(null);
  }, []);

  // 🔟 移除卡片處理
  const handleRemove = useCallback(
    (type: string) => {
      removeType(type);
    },
    [removeType],
  );

  // 1️⃣1️⃣ Combobox 選擇處理
  const handleSelect = useCallback(
    (type: string) => {
      if (watchedTypes.includes(type)) {
        removeType(type);
      } else {
        addType(type);
      }
      setComboboxOpen(false);
    },
    [watchedTypes, addType, removeType],
  );

  return (
    <Card className={cn("h-full flex flex-col shadow-md bg-card", className)}>
      <CardHeader className="pb-3 border-b flex-none space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {t("watchlist.title")}
            {/* 動態指示器 */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </CardTitle>
          <Badge variant="secondary" className="px-2 font-mono text-xs">
            {t("watchlist.badge", { seconds: 3 })}
          </Badge>
        </div>

        {/* ✨ Combobox for Machine Type Selection */}
        <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={comboboxOpen}
              className="w-full justify-between"
            >
              {t("watchlist.actions.addMachine")}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder={t("watchlist.actions.searchPlaceholder")} />
              <CommandEmpty>{t("watchlist.actions.notFound")}</CommandEmpty>
              <CommandGroup>
                {availableTypes.map((type) => (
                  <CommandItem
                    key={type}
                    value={type}
                    onSelect={() => handleSelect(type)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        watchedTypes.includes(type)
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {type}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </CardHeader>

      {/* ✨ 防崩潰關鍵: flex-1 + min-h-0 + overflow-hidden + p-0 */}
      <CardContent className="flex-1 min-h-0 p-0 overflow-hidden relative">
        {/* ✨ ScrollArea 必須有 h-full */}
        <ScrollArea className="h-full">
          <div className="p-3 space-y-2">
            {isLoading && watchedTypes.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
                {t("watchlist.messages.loading")}
              </div>
            ) : watchedTypes.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
              >
                <SortableContext
                  items={watchedTypes}
                  strategy={verticalListSortingStrategy}
                >
                  {watchedTypes.map((type) => {
                    // 🧠 用 item.id 比對 (API 回傳的 id 等於查詢的機型名稱)
                    const item = items.find((i) => i.id === type);
                    return (
                      <WatchlistCard
                        key={type}
                        type={type}
                        data={item}
                        onRemove={handleRemove}
                      />
                    );
                  })}
                </SortableContext>

                {/* ✨ Portal: 將拖曳物體渲染到 body */}
                {createPortal(
                  <DragOverlay dropAnimation={null}>
                    {activeType ? (
                      <WatchlistCard
                        type={activeType}
                        data={items.find((i) => i.id === activeType)}
                        onRemove={() => {}}
                        dragOverlay
                      />
                    ) : null}
                  </DragOverlay>,
                  document.body,
                )}
              </DndContext>
            ) : (
              <div className="flex h-40 items-center justify-center text-muted-foreground text-sm text-center px-4">
                {t("watchlist.messages.empty")}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
