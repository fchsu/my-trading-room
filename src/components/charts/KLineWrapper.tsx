
'use client'

import { useEffect, useRef } from 'react'
import { init, dispose, Chart } from 'klinecharts'
import { KLineData } from '@/types'

interface KLineWrapperProps {
	symbol: string
	// For Phase 2, we might not pass real data yet, but let's allow it
	initialData?: KLineData[]
}

// TODO: The data should be updated in the real-time by the Binance WebSocket
// TODO: The kline should be re-rendered when the window is resized
export function KLineWrapper({ symbol, initialData }: KLineWrapperProps) {
	const chartContainerRef = useRef<HTMLDivElement>(null)
	const chartInstanceRef = useRef<Chart | null>(null)

	useEffect(() => {
		const container = chartContainerRef.current
		if (!container) return

		// 1. Initialize Chart
		chartInstanceRef.current = init(container)

		// 2. Generate Mock Data if none provided (for Demo)
		const dataList = initialData || generateMockData()
		chartInstanceRef.current?.applyNewData(dataList)

		// 3. Cleanup
		return () => {
			dispose(container)
		}
	}, [symbol, initialData])

	return (
		<div className="w-full h-[400px] bg-background">
			<div
				ref={chartContainerRef}
				className="w-full h-full"
			/>
		</div>
	)
}

function generateMockData(): KLineData[] {
	const data: KLineData[] = []
	let price = 100
	const now = Date.now()

	for (let i = 0; i < 100; i++) {
		const timestamp = now - (100 - i) * 60 * 60 * 1000 * 24 // Daily
		const open = price
		const close = price + (Math.random() * 10 - 5)
		const high = Math.max(open, close) + Math.random() * 5
		const low = Math.min(open, close) - Math.random() * 5
		const volume = Math.floor(Math.random() * 10000)

		data.push({
			timestamp,
			open,
			high,
			low,
			close,
			volume
		})

		price = close
	}
	return data
}
