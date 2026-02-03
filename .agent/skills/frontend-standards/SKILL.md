---
name: frontend-standards
description: 專案前端技術規範與開發標準 (Frontend Standards)
---

# Frontend Standards Skill

此 Skill 封裝了本專案 (My Trading Room) 的核心技術規範。當您需要編寫新的前端元件、修改圖表或進行重構時，請嚴格遵守以下準則。

## 1. 核心技術選型

- **Next.js**: `v16.1+` (App Router, Server Actions)
- **React**: `v19+` (Use Hook, Server Components)
- **KLineCharts**: `v9.x` ( **Locked Version** )
- **Styling**: `TailwindCSS v4`

## 2. KLineCharts 開發守則 (v9)

本專案使用 v9 版本，與 v10 API 不相容。

### ❌ 錯誤示範 (Don'ts)
- 不要使用扁平化的樣式物件 (e.g. `styles: { color: 'red' }`)。
- 不要忘記鎖定 Overlay (e.g. 缺少 `lock: true` 會導致藍色虛線)。

### ✅ 正確範例 (Dos)
```typescript
chart.createOverlay({
  name: 'simpleLine',
  lock: true, // 🔒 必填
  styles: {
    line: { // 🎨 必須巢狀定義
      style: 'solid',
      color: '#FAC858',
      size: 2
    }
  },
  points: [{ timestamp: 16298282, value: 100 }]
})
```

## 3. Next.js / React 19 最佳實踐

1.  **資料抓取**: 優先使用 Server Components 直接讀取 Supabase。
2.  **互動**: 僅在需要 `onClick`/`useState` 的末端元件加上 `'use client'`。
3.  **圖片**: 強制使用 `<Image />` 並設定明確寬高以防止 CLS。

## 4. 無障礙 (A11y)

- **鍵盤**: 確保所有圖表與 Grid 可透過 `Tab` 鍵導航。
- **對比**: 確保關鍵數據顏色 (如 P1 線) 對比度 > 4.5:1。
