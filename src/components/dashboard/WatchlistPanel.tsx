/**
 * =====================================
 * 👁️ WatchlistPanel - 即時監控清單
 * =====================================
 * 顯示重點設備的即時監控數據
 */

import { Thermometer, Gauge, Wind, Waves } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { WatchlistItem } from "@/mocks/data";
import { getWatchlistStatusColor } from "@/mocks/data";

/**
 * @typedef {Object} WatchlistPanelProps
 * @property {WatchlistItem[]} items - 監控項目列表
 */
interface WatchlistPanelProps {
  items: WatchlistItem[];
}

/**
 * 根據監控類型返回對應圖示
 */
function getTypeIcon(type: WatchlistItem["type"]) {
  const iconMap = {
    temperature: Thermometer,
    speed: Gauge,
    pressure: Wind,
    vibration: Waves,
  };
  return iconMap[type];
}

/**
 * WatchlistPanel 組件 - 即時監控清單
 *
 * @param props - 組件屬性
 * @param props.items - 監控項目資料
 * @returns WatchlistPanel 元素
 *
 * 🧠 設計決策:
 * - Compact Mode: 針對 25% 寬度欄位優化
 * - 使用 Avatar 顯示監控類型圖示
 * - 右側顯示即時數值與狀態顏色
 *
 * 💡 視覺層次:
 * - 第一行: Machine Name (truncate 防止破版)
 * - 第二行: Status | Temperature (小字體)
 * - 緊湊間距: space-y-3 代替 space-y-4
 */
function WatchlistPanel({ items }: WatchlistPanelProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Watchlist Monitor</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {items.map((item) => {
            const Icon = getTypeIcon(item.type);
            const statusColor = getWatchlistStatusColor(item.status);

            return (
              <div key={item.id} className="flex items-center gap-2">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-tight">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{item.type}</span>
                    <span>|</span>
                    <span className={statusColor}>
                      {item.value}
                      {item.unit}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default WatchlistPanel;
