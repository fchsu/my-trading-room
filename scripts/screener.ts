import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { analyzeStock } from '../src/lib/strategy/brokenBottom'
import { generateMockKLines } from '../src/lib/mockData'

// Helper to load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runScreener() {
  console.log('🔍 Starting Automated Strategy Screener (2B Pattern)...')

  // 1. Fetch active tickers
  const { data: tickers, error: tickerError } = await supabase
    .from('tickers')
    .select('*')
    .eq('is_active', true)

  if (tickerError || !tickers) {
    console.error('Error fetching tickers:', tickerError)
    return
  }

  console.log(`📊 Processing ${tickers.length} tickers...`)

  const today = new Date().toISOString().split('T')[0]

  for (const ticker of tickers) {
    // 2. Mock fetching/generating K-lines
    const candles = generateMockKLines(ticker.symbol)

    // 3. Analyze
    const result = analyzeStock(ticker.symbol, candles)

    if (result.matched) {
      console.log(`✅ MATCH: ${ticker.symbol} fits 2B Pattern!`)

      // 4. Update Daily Analysis in Supabase
      const { error: updateError } = await supabase
        .from('daily_analysis')
        .upsert({
          ticker: ticker.symbol,
          market: ticker.market,
          date: today,
          close_price: candles[candles.length - 1].close,
          change_percent: 0, // Mocked for now
          volume: candles[candles.length - 1].volume,
          strategy_tags: ['BROKEN_BOTTOM']
        }, { onConflict: 'ticker,date' })

      if (updateError) {
        console.error(`Error updating analysis for ${ticker.symbol}:`, updateError)
      }
    } else {
      console.log(`❌ ${ticker.symbol}: ${result.reason.join(', ')}`)

      // Clear strategy tags for non-matching stocks to remove them from previous results
      const { error: clearError } = await supabase
        .from('daily_analysis')
        .upsert({
          ticker: ticker.symbol,
          market: ticker.market,
          date: today,
          close_price: candles[candles.length - 1].close,
          change_percent: 0,
          volume: candles[candles.length - 1].volume,
          strategy_tags: [] // CLEAR TAGS
        }, { onConflict: 'ticker,date' })

      if (clearError) {
        console.error(`Error clearing tags for ${ticker.symbol}:`, clearError)
      }
    }
  }

  console.log('🏁 Screener run complete.')
}

runScreener()
