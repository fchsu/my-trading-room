# My Trading Room (Automated Trading Dashboard)

This is a personal trading room and quantitative backtesting system developed collaboratively with **AI Agents**.
The core objective is to build an All-in-One platform capable of automated screening, analysis, backtesting, and simulated trading.

## 🎯 Project Vision

Combining **Next.js 16 (App Router)**, **Supabase (PostgreSQL)**, and **Trading Agents (AI)** to achieve:
1.  **Automated Screening**: Daily market scan to identify high-probability patterns like "2B Reversal (Broken Bottom)".
2.  **Visual Analysis**: Automatic annotation of entry points (Pivots) and support/resistance levels on K-Line charts.
3.  **Simulated Trading**: Virtual funds for strategy backtesting and paper trading.

---

## 🚀 Current Status (Phase 3 Complete)

### ✅ Phase 1: Infrastructure
*   [x] **Next.js 16** project initialization (TailwindCSS v4, Shadcn/UI, Lucide React).
*   [x] **Supabase** database integration (Auth, Tables, RLS Policies).
*   [x] Database schema designed for `tickers` and `daily_analysis`.
*   [x] **klinecharts** integration for technical analysis visualization.

### ✅ Phase 2: Prototyping
*   [x] Implemented `KLineWrapper` component for interactive charts.
*   [x] Created `StockCard` and `ScreenerGrid` for dashboard-style stock listing.
*   [x] Integrated `jiti` for executing TypeScript scripts directly (e.g., `scripts/seed.ts`).

### ✅ Phase 3: Automated Strategy Screener
*   [x] **Core Algorithm**: Implemented `brokenBottom.ts` to identify the **2B Pattern** (P0-P4 Pivots).
*   [x] **Unit Testing**: 100% test coverage with Vitest (`brokenBottom.test.ts`).
*   [x] **Screener Script**: `scripts/screener.ts` scans stocks and saves results to Supabase.
*   [x] **Visualization**: Frontend charts automatically overlay **Pivot Markers (H/L)** and **Yellow P1 Support Lines**.
*   [x] **Mock System**: Shared `src/lib/mockData.ts` ensures consistency between backend logic and frontend UI with **Seeded Randomness**.
*   [x] **Persistence Fix**: Automated screener now clears stale tags for stocks that no longer match the pattern.

---

## 🛠️ Tech Stack

*   **Frontend**: Next.js 16.1.1, React 19.2.3, TailwindCSS 4, Shadcn/UI
*   **Database**: Supabase (PostgreSQL)
*   **Charting**: klinecharts 9.8.12
*   **Testing**: Vitest, React Testing Library
*   **Scripting**: jiti (Run TS directly)

---

## 🚦 How to Run

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
Create `.env.local` based on `.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Initialize Database Schema
Copy the contents of `supabase/schema.sql` and execute it in your Supabase SQL Editor to create tables and RLS policies.

### 4. Run the Screener Script
This generates mock K-line data and identifies 2B patterns:
```bash
pnpm exec jiti scripts/screener.ts
```

### 5. Start Frontend Development Server
```bash
pnpm dev
```
Open `http://localhost:3000` in your browser. Click on **AAPL** or **2330.TW** to view the automated chart analysis with overlays.

---

## 📅 Roadmap

*   **Phase 4**: **Automation & Real Data** (Integration with Real Market Data APIs, GitHub Actions Cron)
*   **Phase 5**: **Trading Dashboard** (Order Interface, Position Management, PnL Tracking)
