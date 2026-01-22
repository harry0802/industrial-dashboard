# Industrial Dashboard

模擬企業內部使用的「工業營運儀表板」，展示前端處理**大量數據 (10 萬筆+)**、**即時更新 (Real-time)**、**效能監控**以及**複雜互動**的能力。

## Table of Contents

- [Industrial Dashboard](#industrial-dashboard)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
    - [Tech Stack](#tech-stack)
  - [Installation](#installation)
    - [系統需求](#系統需求)
    - [安裝步驟](#安裝步驟)
    - [環境變數](#環境變數)
  - [Quick Start](#quick-start)
  - [Usage](#usage)
    - [基本操作](#基本操作)
    - [專案結構](#專案結構)
    - [組件設計模式](#組件設計模式)
    - [開發規範](#開發規範)
  - [Known Issues and Limitations](#known-issues-and-limitations)
  - [AI 協助開發說明](#ai-協助開發說明)
    - [應用範圍](#應用範圍)
    - [目的與效益](#目的與效益)
    - [實際開發流程](#實際開發流程)
      - [工具選擇](#工具選擇)
      - [開發流程圖](#開發流程圖)
      - [完整流程說明](#完整流程說明)
        - [階段一：需求分析 (Gemini pro)](#階段一需求分析-gemini-pro)
        - [階段二：Prompt 設計](#階段二prompt-設計)
        - [階段三：開發執行 (Claude)](#階段三開發執行-claude)
        - [階段四：驗證](#階段四驗證)
      - [實際案例](#實際案例)
    - [開發原則](#開發原則)
      - [迭代式開發](#迭代式開發)
      - [明確分工](#明確分工)
      - [工程師價值](#工程師價值)
    - [參考資料](#參考資料)
  - [Getting Help](#getting-help)

## Introduction

Industrial Dashboard 是一個前端面試實作專案，旨在展示以下核心能力：

- **大量數據處理**：使用 TanStack Table + Virtual 實現 10 萬筆資料的虛擬化表格
- **即時更新**：透過 Polling 機制實現 Watchlist 數值即時監控
- **效能監控**：使用 Ky Hooks 追蹤 API 延遲，記錄頁面渲染時間
- **複雜互動**：圖表縮放、拖曳排序、多欄位篩選
- **響應式設計**：Mobile-first RWD，支援桌面、平板、手機

### Tech Stack

| 分類                | 技術                     | 說明                               |
| ------------------- | ------------------------ | ---------------------------------- |
| **Framework**       | React 19 + TypeScript    | Vite 建置                          |
| **Package Manager** | pnpm                     | 高效依賴管理                       |
| **UI Components**   | shadcn/ui + Radix UI     | 無障礙優先的 Headless 組件         |
| **Styling**         | Tailwind CSS 4           | Utility-first CSS                  |
| **State (Local)**   | Zustand                  | 輕量全域狀態管理                   |
| **State (Server)**  | TanStack Query           | API 快取與同步                     |
| **Table**           | TanStack Table + Virtual | 10 萬筆虛擬化表格                  |
| **Charts**          | Recharts                 | 可組合式資料視覺化                 |
| **Network**         | Ky                       | 現代化 Fetch 封裝，支援 Hooks 攔截 |
| **Validation**      | Zod                      | Schema 驗證                        |
| **DnD**             | dnd-kit                  | 拖曳排序                           |
| **i18n**            | i18next + react-i18next  | 國際化                             |
| **Themes**          | next-themes              | Light/Dark 模式切換                |
| **Error Handling**  | react-error-boundary     | 防止白屏                           |
| **Date**            | date-fns                 | 日期格式化                         |
| **CSV**             | papaparse                | CSV 解析與匯出                     |
| **Export**          | html-to-image            | 圖表匯出 PNG/SVG                   |

## Installation

### 系統需求

- Node.js 18+
- pnpm 8+

### 安裝步驟

```bash
# 1. Clone 專案
git clone https://github.com/your-username/industrial-dashboard.git
cd industrial-dashboard

# 2. 安裝依賴
pnpm install

# 3. 設定環境變數
cp .env.example .env.local
```

### 環境變數

```env
VITE_API_BASE_URL=https://fesysdyhg3ih26it.fs-technology.com
```

## Quick Start

```bash
# 啟動開發伺服器
pnpm dev
```

開啟瀏覽器訪問 `http://localhost:5173`

## Usage

### 基本操作

```bash
# 開發模式
pnpm dev

# 建置生產版本
pnpm build

# 預覽生產版本
pnpm preview

# 程式碼檢查
pnpm lint
```

### 專案結構

```text
src/
├── features/                 # 業務功能模組
│   ├── dashboard/            # 儀表板聚合頁面
│   ├── kpi/                  # 關鍵績效指標
│   ├── charts/               # 趨勢圖表
│   ├── equipment/            # 設備列表 (10 萬筆虛擬化)
│   └── watchlist/            # 監控清單 (即時更新 + 拖曳排序)
│
├── components/               # 共用元件
│   ├── ui/                   # shadcn/ui 基礎元件
│   ├── layout/               # App Shell (Header, Sidebar)
│   ├── chart/                # Chart Compound Components
│   ├── equipment-table/      # EquipmentTable Compound Components
│   └── performance/          # 效能監控面板
│
├── hooks/                    # 共用 Hooks
├── services/                 # API 服務層
├── stores/                   # 全局狀態 (Zustand)
├── lib/                      # 工具函數
└── i18n/                     # 國際化
```

### 組件設計模式

本專案採用 **Compound Components + Context** 模式，實現控制反轉 (IoC)。

```tsx
// Chart 使用範例
import { Chart } from "@/components/chart";
import { XAxis, YAxis } from "recharts";

function TrendChart({ data }) {
  return (
    <Chart.Root data={data} config={config} xDataKey="time">
      <Chart.ResetButton />
      <Chart.Canvas height={400}>
        <XAxis dataKey="time" />
        <YAxis />
        <Chart.Series dataKey="production" type="area" />
        <Chart.Series dataKey="defect" type="line" />
        <Chart.Tooltip />
        <Chart.Legend enableToggle />
      </Chart.Canvas>
    </Chart.Root>
  );
}
```
[ Chart 組件有問題 ，已暫時解決 ](https://github.com/harry0802/industrial-dashboard/issues/1)

```tsx
// EquipmentTable 使用範例
import { EquipmentTable } from "@/components/equipment-table";

function EquipmentPage() {
  return (
    <EquipmentTable.Root table={table} onExportCSV={exportCSV}>
      <EquipmentTable.Toolbar />
      <EquipmentTable.Content height={600} emptySlot={<EmptyState />} />
    </EquipmentTable.Root>
  );
}
```

### 開發規範

| 原則               | 說明                                             |
| ------------------ | ------------------------------------------------ |
| **Push Ifs Up**    | 條件判斷移至呼叫者，讓子函數維持純粹職責         |
| **Push Fors Down** | 迴圈下沉至批次處理函數                           |
| **AHA**            | Avoid Hasty Abstractions，寧可重複也不要錯誤抽象 |

## Known Issues and Limitations

- 目前僅支援繁體中文與英文、日文介面
- 圖表匯出功能在 Safari 可能有相容性問題

## AI 協助開發說明

### 應用範圍

我在開發流程中使用 AI 協助以下環節：

- **文檔整理**：將 API 文檔轉換為結構化的開發規格書
- **需求管理**：把需求整理成可追蹤的 Todo List
- **程式開發**：透過 Code Agent 執行實際編碼工作

### 目的與效益

使用 AI 的主要目的是讓我能專注在「系統設計」而非「重複性編碼」。透過 AI 協助，文檔和需求變得更結構化，有助於團隊協作和後續維護。我負責架構設計與 Code Review，AI 處理規範性的編碼工作。

### 實際開發流程

#### 工具選擇

基於 token 成本考量，我採用雙 AI 協作：

- **Gemini pro**：需求討論、架構規劃、Prompt 生成（可免費連接 Github Project）
- **Claude Code**：程式開發執行（Pro plan token 有限，專注用於編碼）

_為何不使用 MCP？_ MCP 會消耗大量 token，直接提供明確檔案路徑更有效率。

#### 開發流程圖

```text
┌─────────────────┐
│Gemini pro需求討論│
│ (連接 Github)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  產出 Prompt    │
│  (PTCF 框架)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Claude Plan 模式 │
│   (規劃步驟)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  我審核計畫      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Claude 執行開發  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  驗證 & Review  │
│ (TS/打包/UI測試) │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  通過      發現問題
    │         │
    │         ▼
    │    ┌─────────┐
    │    │撤回暫存。 │
    │    └────┬────┘
    │         │
    │         ▼
    │    ┌─────────────┐
    │    │調整 Prompt  │
    │    └────┬────────┘
    │         │
    │         └───────┐
    │                 │
    ▼                 ▼
 commit          回到 Claude
```

#### 完整流程說明

##### 階段一：需求分析 (Gemini pro)

- 連接專案 Github Repository 進行功能討論
- 提供技術文件與開發規範作為參考依據
- 迭代討論至產出明確的開發目標與 Prompt

##### 階段二：Prompt 設計

採用 PTCF 框架確保指令精確：

```markdown
**角色**: 資深 [技術棧] 工程師
**任務**: 在 [檔案路徑] 實作 [具體功能]
**背景**: 技術環境、相關依賴、限制條件
**要求**: 完整程式碼 + 變更說明
```

關鍵原則：

- 提供明確檔案路徑，避免 AI 廣泛檢索
- 附上 Schema 或範例，減少理解偏差
- 要求 AI 先確認理解再產出程式碼

##### 階段三：開發執行 (Claude)

- 使用 Plan 模式讓 AI 規劃執行步驟，我進行審核
- 配置 `claude.md` 定義專案技術棧與程式碼風格
- Agent 執行開發，我負責架構決策與 Code Review

##### 階段四：驗證

- TypeScript 編譯檢查
- 專案打包驗證
- 人工 UI 功能測試
- 若有問題使用 `git reset` 回滾，調整 Prompt 後重新執行

#### 實際案例

以多語系功能為例：

1. Gemini pro 討論翻譯策略與檔案結構
2. 產出包含檔案路徑、翻譯對照表的結構化 Prompt
3. Claude 在 `src/i18n/locales/` 生成語言檔
4. Review 確認翻譯準確性與檔案結構
5. 測試語言切換功能後 commit

### 開發原則

#### 迭代式開發

優先建立可運行的最小版本，再針對效能或功能進行優化。

#### 明確分工

- 我的職責：系統架構、技術選型、品質把關、判斷正確性
- AI 的職責：規範性編碼、文檔整理、執行既定流程

#### 工程師價值

AI 可能產生過時寫法、誤解需求或引入 bug。識別並修正這些問題需要工程師的專業判斷與持續學習，這正是工程師的核心價值所在。

### 參考資料

- [Prompt Engineering Playbook](https://addyo.substack.com/p/the-prompt-engineering-playbook-for)
- [Claude.md Best Practices](https://www.humanlayer.dev/blog/writing-a-good-claude-md)

## Getting Help

如有問題或建議，請透過以下方式聯繫：

- 開啟 [GitHub Issue](https://github.com/your-username/industrial-dashboard/issues)
