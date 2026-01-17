# 🎨 TrendChart - Compound Components Pattern

## 🐻 設計理念

使用 **Compound Components Pattern**（樂高模式），實現完全解耦的組件架構。

### 為什麼選擇 Compound Components？

| 問題 | 舊方法 | Compound Components |
|------|--------|---------------------|
| 想改按鈕位置 | 😫 改底層組件 | ✅ 外部自由擺放 |
| 想移除某個功能 | 😤 加 props 控制 | ✅ 直接不放就好 |
| 想新增功能 | 😡 改底層重構 | ✅ 新增一個組件 |

## 📦 完整 API

```tsx
import TrendChart from "@/components/TrendChart";

<TrendChart.Root>           // Provider (狀態管理)
<TrendChart.Canvas>         // 圖表渲染器
<TrendChart.ResetButton>    // 重置縮放按鈕
<TrendChart.TypeSelector>   // 圖表類型選擇器
<TrendChart.ExportMenu>     // 匯出選單 (PNG/SVG)
```

## 🎯 使用範例

### 1️⃣ 完整功能版（所有控制元件）

```tsx
import TrendChart from "@/components/TrendChart";

<TrendChart.Root data={chartData} defaultChartType="area">
  <Card>
    <CardHeader className="flex flex-row justify-between">
      <CardTitle>Production Trend</CardTitle>

      {/* 🎨 外部決定要哪些按鈕！ */}
      <div className="flex gap-2">
        <TrendChart.ResetButton />
        <TrendChart.TypeSelector />
        <TrendChart.ExportMenu />
      </div>
    </CardHeader>

    <CardContent>
      <TrendChart.Canvas enableZoom enablePan />
    </CardContent>
  </Card>
</TrendChart.Root>
```

### 2️⃣ 極簡版（只要圖表）

```tsx
<TrendChart.Root data={chartData}>
  <TrendChart.Canvas />
</TrendChart.Root>
```

### 3️⃣ 自訂組合（只要重置按鈕）

```tsx
<TrendChart.Root data={chartData}>
  <div className="space-y-4">
    <div className="flex justify-between">
      <h3>My Chart</h3>
      <TrendChart.ResetButton />
    </div>
    <TrendChart.Canvas />
  </div>
</TrendChart.Root>
```

### 4️⃣ 響應式佈局

```tsx
<TrendChart.Root data={chartData}>
  <Card>
    <CardHeader>
      <CardTitle>Production Trend</CardTitle>
    </CardHeader>

    <CardContent>
      {/* 桌面：控制列在上方 */}
      <div className="hidden md:flex justify-end gap-2 mb-4">
        <TrendChart.ResetButton />
        <TrendChart.TypeSelector />
        <TrendChart.ExportMenu />
      </div>

      <TrendChart.Canvas />

      {/* 手機：控制列在下方 */}
      <div className="flex md:hidden justify-center gap-2 mt-4">
        <TrendChart.ResetButton />
        <TrendChart.TypeSelector />
      </div>
    </CardContent>
  </Card>
</TrendChart.Root>
```

## 🔧 各組件說明

### TrendChart.Root

**作用**：Provider，提供共享狀態給所有子組件

```tsx
interface RootProps {
  data: ChartDataPoint[];           // 必填：圖表數據
  children: ReactNode;              // 必填：子組件
  defaultChartType?: ChartType;     // 可選：預設圖表類型 (area/line/bar)
}
```

### TrendChart.Canvas

**作用**：核心圖表渲染器

```tsx
interface CanvasProps {
  className?: string;
  enableZoom?: boolean;   // 啟用滾輪縮放
  enablePan?: boolean;    // 啟用拖曳平移
}
```

### TrendChart.ResetButton

**作用**：重置縮放/平移到初始狀態

```tsx
interface ResetButtonProps {
  className?: string;
}
```

### TrendChart.TypeSelector

**作用**：切換圖表類型 (Area/Line/Bar)

```tsx
interface TypeSelectorProps {
  className?: string;
}
```

### TrendChart.ExportMenu

**作用**：匯出圖表為 PNG 或 SVG

```tsx
interface ExportMenuProps {
  className?: string;
}
```

## 🚀 進階用法

### 獨立使用 Canvas (無 Context)

如果你不需要任何控制元件，可以直接使用 Canvas：

```tsx
import { Canvas } from "@/components/TrendChart";

<Canvas
  data={chartData}
  chartType="line"
  enableZoom
  enablePan
/>
```

### 受控模式

```tsx
const [chartType, setChartType] = useState<ChartType>("area");
const [window, setWindow] = useState<[number, number]>([0, 100]);

<Canvas
  data={chartData}
  chartType={chartType}
  onChartTypeChange={setChartType}
  currentWindow={window}
  onWindowChange={setWindow}
/>
```

### 擴展圖表類型

```tsx
import { Canvas, createCustomRegistry } from "@/components/TrendChart";
import { HeatmapRenderer } from "./custom/HeatmapRenderer";

const customRenderers = createCustomRegistry({
  heatmap: HeatmapRenderer,
});

<Canvas
  data={chartData}
  renderersMap={customRenderers}
  chartType="heatmap"
/>
```

## 📂 檔案結構

```
src/components/TrendChart/
├── index.ts                  # 主入口 (Compound Components)
├── context.tsx               # Context 定義
├── Root.tsx                  # Provider 組件
├── CanvasWrapper.tsx         # Canvas 包裝器
├── ResetButton.tsx           # 重置按鈕
├── TypeSelector.tsx          # 類型選擇器
├── ExportMenu.tsx            # 匯出選單
├── constants.ts              # 常量配置
└── core/
    ├── Canvas.tsx            # 核心渲染器 (無 Context)
    ├── types.ts              # 型別定義
    └── renderers/
        ├── registry.ts       # 渲染器註冊系統
        ├── AreaRenderer.tsx
        ├── LineRenderer.tsx
        └── BarRenderer.tsx
```

## ✨ 優勢總結

1. **完全解耦**：按鈕和圖表分離，互不影響
2. **靈活組合**：像樂高一樣自由組裝
3. **易於擴展**：新增功能不用改底層
4. **直覺 API**：使用方式如同 HTML 標籤
5. **多種模式**：Compound / Standalone / Controlled

## 🎓 設計模式

- **Compound Components Pattern** (🐻)：主要模式
- **Provider Pattern** (🦊)：狀態共享
- **Inversion of Control** (IoC)：控制權交給使用者
- **Render Props Pattern** (🦁)：Canvas 支援受控模式

## 📝 最佳實踐

1. **優先使用 Compound**：除非需要完全客製化
2. **保持 Root 簡單**：只傳必要的 props
3. **善用 className**：透過 Tailwind 客製化樣式
4. **按需引入**：只放你需要的組件
