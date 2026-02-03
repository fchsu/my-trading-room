
import { supabase } from "@/lib/supabase"
import { ScreenerGrid } from "@/components/ScreenerGrid"
import { StockCardData } from "@/types"

export const revalidate = 60 // Revalidate every minute

interface AnalysisRow {
  ticker: string
  close_price: number
  change_percent: number
  volume: number
  strategy_tags: string[] | null
  tickers: {
    name: string
  } | null
}

export default async function Home() {
  // Fetch today's analysis
  const today = new Date().toISOString().split('T')[0]

  // TODO: In a real app, you might want to handle timezone issues more robustly
  // For now, we fetch all records for "today" (UTC based on server)

  const { data, error } = await supabase
    .from('daily_analysis')
    .select(`
      *,
      tickers (
        name
      )
    `)
    .eq('date', today)
    .order('change_percent', { ascending: false })

  if (error) {
    console.error('Error fetching data:', error)
    return (
      // TODO: Add i18n with en-US and zh-TW
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Failed to load data. Please check console.</div>
      </main>
    )
  }

  // Transform to view model
  // TODO: Refactor this to use a more type-safe approach
  const items: StockCardData[] = (data as unknown as AnalysisRow[] || []).map((row) => ({
    symbol: row.ticker,
    name: row.tickers?.name || 'Unknown',
    price: row.close_price,
    change: row.change_percent,
    volumeStr: formatVolume(row.volume),
    tags: row.strategy_tags || []
  }))
    .filter((item) => item.tags.length > 0) // Only show stocks that match a strategy

  return (
    <main className="container mx-auto py-8">
      <header className="mb-8 px-4">
        <h1 className="text-3xl font-bold tracking-tight">Daily Screener</h1>
        <p className="text-muted-foreground mt-2">
          {/* TODO: Check if the crypto data is included in the daily_analysis table, if not, add it by Binance API */}
          Top performing stocks and crypto from the last session.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No data found for today ({today}). <br />
          (Hint: Run <code>pnpm exec jiti scripts/seed.ts</code> if in dev)
        </div>
      ) : (
        <ScreenerGrid items={items} />
      )}
    </main>
  )
}

// TODO: Refactor this to use a more precise method
// TODO: Move to utils.ts
function formatVolume(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M'
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K'
  }
  return num.toString()
}
