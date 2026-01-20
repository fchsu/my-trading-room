
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { type DailyAnalysis, MarketType } from '../src/types'

// Load env vars from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use Service Key for bypassing RLS if needed, or Anon Key if Policy allows

if (!supabaseUrl || !supabaseServiceKey) {
	console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
	process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const mockTickers = [
	{ symbol: 'AAPL', name: 'Apple Inc.', market: MarketType.US },
	{ symbol: 'NVDA', name: 'NVIDIA Corp.', market: MarketType.US },
	{ symbol: 'TSLA', name: 'Tesla Inc.', market: MarketType.US },
	{ symbol: 'MSFT', name: 'Microsoft Corp.', market: MarketType.US },
	{ symbol: '2330.TW', name: 'TSMC', market: MarketType.TW_SE },
	{ symbol: '2317.TW', name: 'Hon Hai', market: MarketType.TW_SE },
	{ symbol: 'BTCUSDT', name: 'Bitcoin', market: MarketType.CRYPTO },
	{ symbol: 'ETHUSDT', name: 'Ethereum', market: MarketType.CRYPTO },
]

async function seed() {
	console.log('🌱 Seeding Tickers...')

	// 1. Upsert Tickers
	const { error: tickerError } = await supabase
		.from('tickers')
		.upsert(
			mockTickers.map(t => ({
				...t,
				is_active: true,
				last_updated_at: new Date().toISOString()
			})),
			{ onConflict: 'symbol' }
		)

	if (tickerError) {
		console.error('Error seeding tickers:', tickerError)
		return
	}

	console.log('✅ Tickers seeded.')

	// 2. Insert Daily Analysis (Mock for Today)
	console.log('🌱 Seeding Daily Analysis...')

	const today = new Date().toISOString().split('T')[0]

	// Clear old data for today to avoid dupes during dev
	await supabase.from('daily_analysis').delete().eq('date', today)

	const analysisData: Partial<DailyAnalysis>[] = mockTickers.map(t => ({
		ticker: t.symbol,
		market: t.market,
		date: today,
		close_price: Math.floor(Math.random() * 1000) + 100, // Random price
		change_percent: Number((Math.random() * 10 - 5).toFixed(2)), // -5% to +5%
		volume: Math.floor(Math.random() * 10000000),
		strategy_tags: Math.random() > 0.7 ? ['VOLUME_SPIKE'] : [],
	}))

	const { error: analysisError } = await supabase
		.from('daily_analysis')
		.insert(analysisData)

	if (analysisError) {
		console.error('Error seeding analysis:', analysisError)
	} else {
		console.log(`✅ Daily Analysis seeded for ${today} (${analysisData.length} records).`)
	}
}

seed()
