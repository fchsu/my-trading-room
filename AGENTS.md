# Agent Workflow & Roles (AGENTS.md)

本專案採用嚴格的 **4 階段多 Agent 協作流程**。任何功能開發 (Feature Request) 或重大變更 (Major Refactor) 都必須遵循此流程。

## 🎯 專案角色 (Roles)

| 角色程式碼 | 角色名稱 | 職責 (Responsibilities) | 關鍵輸出 |
| :--- | :--- | :--- | :--- |
| **A1** | **PM (Product Manager)** | 需求分析、規格撰寫、釐清使用者意圖 | `spec.md` (Draft) |
| **A2** | **Director** | 技術審查、架構決策、批准規格 | `master_spec.md` |
| **B1** | **Dev (Developer)** | 程式碼實作、單元測試、撰寫功能 | `implementation_plan.md`, Source Code |
| **B2** | **QA (Quality Assurance)** | 程式碼審查 (Code Review)、功能驗收、E2E 測試 | `walkthrough.md`, Test Reports |

---

## 🔄 標準開發流程 (Standard Workflow)

每個 Phase (如 Phase 3, Phase 4) 的子任務 (Step) 皆對應此流程：

### Phase 1: 需求定義 (PM)
1.  **用戶輸入**: 接收使用者的需求描述。
2.  **分析**: A1 (PM) 分析需求，確認核心目標。
3.  **輸出**: 撰寫 `draft_spec.md`，定義功能範圍、User Stories 與初步 UI/UX 草圖。

### Phase 2: 規格審查 (Director)
1.  **審核**: A2 (Director) 檢查 `draft_spec.md` 是否符合專案技術規範 (`frontend-standards`) 與架構原則。
2.  **修訂**: 若有技術風險，退回 A1 修改；若無問題，定稿為 `master_spec.md`。
3.  **計畫**: 批准 `implementation_plan.md`。

### Phase 3: 開發實作 (Dev)
1.  **TDD**: B1 (Dev) 優先撰寫測試案例 (Vitest) - *Red*。
2.  **實作**: 撰寫功能程式碼使其通過測試 - *Green*。
3.  **重構**: 優化程式碼結構 (*Refactor*)，確保符合 Best Practices。
4.  **輸出**: 完成的程式碼與通過的測試報告。

### Phase 4: 驗收與審查 (QA)
1.  **Code Review**: B2 (QA) 讀取 `.agent/skills/code-review/SKILL.md`，對程式碼進行靜態分析。
    *   *Check*: 是否符合 KLineCharts v9 規範？
    *   *Check*: 是否符合 A11y 標準？
2.  **驗收測試**: 執行整合測試或手動驗證。
3.  **交付**: 撰寫 `walkthrough.md` 展示成果，通知用戶完成。

---

## 🛠 用戶指令對照

- `/review`: 呼叫 A2 (Director) 進行規格或計畫審查。
- `/implement`: 呼叫 B1 (Dev) 開始寫 code。
- `/verify`: 呼叫 B2 (QA) 執行驗收。

> **注意**: 在與 Agent 對話時，請明確指定當前處於哪個階段，Agent 會切換至對應的 Persona 進行回應。
