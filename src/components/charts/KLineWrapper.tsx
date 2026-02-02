
'use client'

import { useEffect, useRef } from 'react'
import { init, dispose, Chart, KLineData, LineType } from 'klinecharts'
import { generateMockKLines } from '@/lib/mockData'
import { analyzeStock } from '@/lib/strategy/brokenBottom'

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

	// 1. Initialize Chart once
	useEffect(() => {
		const container = chartContainerRef.current
		if (!container) return

		chartInstanceRef.current = init(container)

		return () => {
			if (container) {
				dispose(container)
			}
		}
	}, []) // Only on mount

	// 2. Update Data when symbol or initialData changes
	useEffect(() => {
		if (!chartInstanceRef.current) return

		const dataList = initialData || generateMockKLines(symbol)
		chartInstanceRef.current.applyNewData(dataList)

		// 3. Visualize 2B Pattern Logic
		const result = analyzeStock(symbol, dataList)
		console.log('DEBUG 2B Result:', result)


		if (result.matched && result.debugInfo) {
			const { pivots, p1_support } = result.debugInfo

			// (B) Draw Support Line (P1)
			const p1 = pivots[1]
			// Extend line to the latest candle
			const endTimestamp = dataList[dataList.length - 1].timestamp

			// Remove previous overlay if exists to force redraw
			chartInstanceRef.current?.removeOverlay({ id: 'p1_support_line' })
			chartInstanceRef.current?.removeOverlay({ id: 'p1_support_tag' })

			chartInstanceRef.current?.createOverlay({
				id: 'p1_support_line',
				name: 'horizontalStraightLine',
				lock: true, // Lock to prevent selection state (blue dashed)
				points: [{ timestamp: p1.timestamp, value: p1_support }],
				styles: {
					line: {
						color: '#FAC858',
						size: 2,
						style: LineType.Solid
					}
				}
			})


			console.log('Drew P1 Line at', p1_support)
		}

	}, [symbol, initialData]) // Only when data-related props change


	return (
		<div className="w-full h-[400px] bg-background">
			<div
				ref={chartContainerRef}
				className="w-full h-full"
			/>
		</div>
	)
}
