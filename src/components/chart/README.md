# Chart Compound Components

基於 **Compound Components** 模式設計的圖表組件庫，實現 **IoC (控制反轉)**。

## 核心概念

- **使用者決定** Reset 按鈕放哪
- **使用者決定** Series 的渲染順序
- **使用者可以自由使用** 原生 Recharts `<XAxis>`, `<YAxis>`

---

## 快速開始

```tsx
import { Chart, type ChartConfig } from "@/components/chart";
import { XAxis, YAxis } from "recharts";

const config: ChartConfig = {
  production: { label: "產量", color: "#3b82f6" },
  defect: { label: "不良品", color: "#ef4444" },
};

function MyChart({ data }) {
  return (
    <Chart.Root data={data} config={config} xDataKey="time">
      <Chart.ResetButton /> {/* 可放任意位置 */}

      <Chart.Canvas height={400}>
        <XAxis dataKey="time" />
        <YAxis />

        <Chart.Series dataKey="production" type="area" />
        <Chart.Series dataKey="defect" type="line" />

        <Chart.Tooltip />
        <Chart.Legend enableToggle />
        <Chart.Brush previewDataKey="production" />
      </Chart.Canvas>
    </Chart.Root>
  );
}
```

---

## 組件 API

### `<Chart.Root>`

Context Provider，必須包裹所有其他 Chart 組件。

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `Record<string, unknown>[]` | ✅ | 圖表資料 |
| `config` | `ChartConfig` | ✅ | 顏色與標籤配置 |
| `xDataKey` | `string` | ✅ | X 軸資料鍵 |
| `zoomSpeed` | `number` | | 滾輪縮放速度 (預設 0.1) |
| `range` | `RangeState` | | 外部控制範圍 (Controlled) |
| `onRangeChange` | `(range) => void` | | 範圍變化回調 |

---

### `<Chart.Canvas>`

渲染 `ResponsiveContainer` + `ComposedChart`，處理滑鼠事件。

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `height` | `number` | `400` | 圖表高度 |
| `showGrid` | `boolean` | `true` | 顯示網格線 |
| `margin` | `object` | `{top:10,right:10,left:0,bottom:0}` | 邊距 |

**Children**: 支援原生 Recharts 組件 (`XAxis`, `YAxis`) 和 Chart 組件。

---

### `<Chart.Series>`

渲染資料系列 (Line / Area / Bar)。

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dataKey` | `string` | ✅ | 資料鍵 |
| `type` | `'line' \| 'area' \| 'bar'` | `'line'` | 圖表類型 |
| `yAxisId` | `'left' \| 'right'` | `'left'` | Y 軸 ID |
| `color` | `string` | | 覆蓋 config 顏色 |
| `fillOpacity` | `number` | | 填充透明度 |
| `strokeWidth` | `number` | `2` | 線條寬度 |

---

### `<Chart.ResetButton>`

縮放重置按鈕，**只有在 `isZoomed` 時才渲染**。

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'outline' \| 'ghost' \| 'secondary'` | `'outline'` | 按鈕變體 |
| `size` | `'sm' \| 'default' \| 'lg'` | `'sm'` | 按鈕尺寸 |
| `children` | `ReactNode` | | 自訂內容 |

---

### `<Chart.Brush>`

底部範圍選擇器，**自動雙向綁定** Context 的 `range`。

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `height` | `number` | `30` | 高度 |
| `previewDataKey` | `string` | | 預覽線條的 dataKey |

---

### `<Chart.Tooltip>`

shadcn 風格的 Tooltip。

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cursor` | `boolean \| object` | `false` | 游標樣式 |

---

### `<Chart.Legend>`

可點擊切換的圖例。

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableToggle` | `boolean` | `true` | 點擊切換 series 顯示 |
| `verticalAlign` | `'top' \| 'middle' \| 'bottom'` | `'bottom'` | 垂直對齊 |

---

### `<Chart.Gradient>`

SVG 漸層定義，用於 Area 填充。

```tsx
<Chart.Canvas>
  <Chart.Gradient id="myGradient" color="#3b82f6" startOpacity={0.8} endOpacity={0} />
  <Chart.Series dataKey="value" type="area" fill="url(#myGradient)" />
</Chart.Canvas>
```

---

## Hooks

### `useChart()`

同時取得 Data + Interaction context。

```tsx
const { data, config, range, isZoomed, resetZoom, hiddenSeries, toggleSeries } = useChart();
```

### `useChartData()`

只取得資料相關 context (較少 re-render)。

```tsx
const { data, xDataKey, config, chartId } = useChartData();
```

### `useChartInteraction()`

只取得互動相關 context。

```tsx
const { range, isZoomed, setRange, resetZoom, selection, hiddenSeries, toggleSeries } = useChartInteraction();
```

---

## 互動功能

| 功能 | 操作方式 |
|------|----------|
| **滾輪縮放** | 滑鼠滾輪上下滾動 |
| **觸控縮放** | 雙指捏合 |
| **拖曳選取** | 滑鼠按住拖曳選擇區域 |
| **Brush 選取** | 拖曳底部 Brush 控制範圍 |
| **圖例切換** | 點擊圖例隱藏/顯示 series |
| **重置縮放** | 點擊 ResetButton |

---

## 進階用法

### Controlled Mode (外部控制範圍)

```tsx
const [range, setRange] = useState({ startIndex: 0, endIndex: 100 });

<Chart.Root
  data={data}
  config={config}
  xDataKey="time"
  range={range}
  onRangeChange={setRange}
>
  ...
</Chart.Root>
```

### 自訂 Reset 按鈕

```tsx
<Chart.ResetButton>
  <MyIcon /> 清除縮放
</Chart.ResetButton>
```

### 雙 Y 軸

```tsx
<Chart.Canvas>
  <YAxis yAxisId="left" />
  <YAxis yAxisId="right" orientation="right" />

  <Chart.Series dataKey="production" yAxisId="left" />
  <Chart.Series dataKey="percentage" yAxisId="right" />
</Chart.Canvas>
```
