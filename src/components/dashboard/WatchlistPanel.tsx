/**
 * =====================================
 * 👁️ WatchlistPanel - 即時監控清單
 * =====================================
 * 顯示重點設備的即時監控數據
 */

import {
  Thermometer,
  Gauge,
  Wind,
  Waves,
  Clock,
} from "lucide-react";
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
 * - 模仿 Dashboard-01 的 "Recent Sales" 列表樣式
 * - 使用 Avatar 顯示監控類型圖示
 * - 右側顯示即時數值與狀態顏色
 *
 * 💡 視覺層次:
 * - 左側: Avatar (圖示) + Name
 * - 右側: Value + Unit (帶狀態顏色)
 * - 底部: Last Update 時間
 */
function WatchlistPanel({ items }: WatchlistPanelProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Watchlist Monitor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => {
            const Icon = getTypeIcon(item.type);
            const statusColor = getWatchlistStatusColor(item.status);

            return (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{item.lastUpdate}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${statusColor}`}>
                    {item.value} {item.unit}
                  </p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {item.type}
                  </p>
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
