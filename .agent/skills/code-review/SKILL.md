---
description: 專案程式碼審查與驗收標準 (Code Review Standards)
---

# Code Review Skill

此 Skill 定義了本專案 (My Trading Room) 的程式碼審查流程。QA Agent 在驗收 (Verification) 階段必須執行此流程。

## 審查清單 (Checklist)

### 1. 技術規範合規性 (Tech Stack Compliance)
- [ ] **Frontend Standards**: 是否符合 `frontend-standards` skill 中的規範？
    - [ ] KLineCharts 是否使用了 v9 API 且鎖定 Overlay (`lock: true`)？
    - [ ] Next.js 是否優先使用 Server Components？
- [ ] **Type Safety**: 是否無 `any` 類型濫用？是否定義了正確的 Interface？

### 2. 邏輯正確性 (Logic Verification)
- [ ] **Edge Cases**: 是否考慮了邊界情況（例如：空資料、API 錯誤、極端數值）？
- [ ] **Tests**: 是否有對應的單元測試或整合測試？測試是否通過？

### 3. 無障礙與效能 (A11y & Perf)
- [ ] **A11y**: 互動元素是否可鍵盤導航？圖片是否有 alt？
- [ ] **Perf**: 是否有不必要的 Re-render？是否有大圖片未優化？

## 執行指令
當被要求進行 Code Review 時，請執行：
1.  讀取變更檔案。
2.  對照上述清單逐一檢查。
3.  若發現問題，明確指出違反哪一條規範，並提供修正建議。
