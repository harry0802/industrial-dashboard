// import React, { useMemo, memo } from "react";
// import {
//   Thermometer,
//   Gauge,
//   Wind,
//   Waves,
//   type LucideIcon,
//   AlertCircle,
// } from "lucide-react";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { cn } from "@/lib/utils";
// import type { WatchlistItem } from "@/mocks/data";
// import { getWatchlistStatusColor } from "@/mocks/data";

// //! =============== 1. 設定與常量 (Config) ===============

// /**
//  * 監控類型圖示映射表
//  * @type {Record<string, LucideIcon>}
//  */
// const TYPE_ICONS: Record<string, LucideIcon> = {
//   temperature: Thermometer,
//   speed: Gauge,
//   pressure: Wind,
//   vibration: Waves,
// };

// //! =============== 2. 類型定義 (Types) ===============

// /**
//  * WatchlistPanel 組件 Props
//  */
// interface WatchlistPanelProps {
//   items: WatchlistItem[];
//   className?: string;
// }

// /**
//  * WatchlistItem 子組件 Props
//  */
// interface WatchlistItemProps {
//   item: WatchlistItem;
// }

// /**
//  * Hook 回傳介面
//  */
// interface UseWatchlistReturn {
//   activeCount: number;
//   isEmpty: boolean;
//   sortedItems: WatchlistItem[]; // 可選：如果需要排序邏輯
// }

// //! =============== 3. 核心邏輯 (Logic Layer) ===============

// /**
//  * Watchlist 業務邏輯 Hook
//  * @description 集中處理數據計算、排序或過濾邏輯
//  * @param {WatchlistItem[]} items - 原始數據列表
//  */
// function useWatchlistLogic(items: WatchlistItem[]): UseWatchlistReturn {
//   // 1. 計算活躍數量 (Memoized)
//   const activeCount = useMemo(() => {
//     return items ? items.length : 0;
//   }, [items]);

//   // 2. 判斷空狀態
//   const isEmpty = activeCount === 0;

//   // 3. 預留數據處理 (如排序)
//   const sortedItems = useMemo(() => items || [], [items]);

//   return {
//     activeCount,
//     isEmpty,
//     sortedItems,
//   };
// }

// //! =============== 4. 組件實作 (View Layer) ===============

// /**
//  * 單一監控項目組件 (Sub-Component)
//  * @description 負責渲染單行監控數據，整合 Avatar 與 Badge
//  */
// const WatchlistItemRow = memo(function WatchlistItemRow({
//   item,
// }: WatchlistItemProps) {
//   // 1. 準備渲染數據
//   const Icon = TYPE_ICONS[item.type] || AlertCircle;
//   const statusColor = getWatchlistStatusColor(item.status);

//   return (
//     <div className="group flex items-center gap-3 rounded-lg border p-3 shadow-sm transition-all hover:bg-accent/50 hover:shadow-md">
//       {/* Icon Section */}
//       <Avatar className="h-9 w-9 shrink-0 border bg-background">
//         <AvatarFallback className="bg-transparent">
//           <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
//         </AvatarFallback>
//       </Avatar>

//       {/* Info Section */}
//       <div className="flex min-w-0 flex-1 flex-col gap-1">
//         <p className="truncate text-sm font-medium leading-none text-foreground">
//           {item.name}
//         </p>
//         <div className="flex items-center gap-2 text-xs text-muted-foreground">
//           <span className="capitalize">{item.type}</span>
//         </div>
//       </div>

//       {/* Value Badge Section */}
//       <Badge
//         variant="outline"
//         className={cn(
//           "ml-auto flex shrink-0 items-center gap-1 font-mono transition-colors",
//           statusColor,
//           "group-hover:bg-background" // Hover 時保持對比度
//         )}
//       >
//         <span className="font-bold">{item.value}</span>
//         <span className="text-[10px] opacity-70">{item.unit}</span>
//       </Badge>
//     </div>
//   );
// });

// WatchlistItemRow.displayName = "WatchlistPanel.Item";

// /**
//  * WatchlistPanel 主組件
//  * @description 即時監控清單容器
//  */
// function WatchlistPanel({ items, className }: WatchlistPanelProps) {
//   // 1. 使用 Custom Hook
//   const { activeCount, isEmpty, sortedItems } = useWatchlistLogic(items);

//   // 2. Push Ifs Up: 處理空狀態視圖
//   if (isEmpty) {
//     return (
//       <Card className={cn("h-full", className)}>
//         <CardHeader className="pb-3">
//           <CardTitle className="text-base">Watchlist Monitor</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
//             <AlertCircle className="h-8 w-8 opacity-50" />
//             <p>無監控項目</p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   // 3. 渲染主視圖 (Push Fors Down)
//   return (
//     <Card className={cn("flex h-full flex-col", className)}>
//       <CardHeader className="pb-3">
//         <div className="flex items-center justify-between">
//           <CardTitle className="text-base">Watchlist Monitor</CardTitle>
//           <Badge
//             variant="secondary"
//             className="px-2 py-0.5 text-xs font-normal"
//           >
//             {activeCount} Active
//           </Badge>
//         </div>
//       </CardHeader>

//       <CardContent className="flex-1 overflow-y-auto pr-2">
//         <div className="space-y-3">
//           {sortedItems.map((item) => (
//             <WatchlistItemRow key={item.id} item={item} />
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// export default WatchlistPanel;
