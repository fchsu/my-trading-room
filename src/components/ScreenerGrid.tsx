
'use client'

import { useState } from 'react'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription
} from "@/components/ui/dialog"
import { StockCard } from "@/components/StockCard"
import { KLineWrapper } from "@/components/charts/KLineWrapper"
import { StockCardData } from "@/types"

interface ScreenerGridProps {
	items: StockCardData[]
}

export function ScreenerGrid({ items }: ScreenerGridProps) {
	const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)

	const selectedItem = items.find(i => i.symbol === selectedSymbol)

	return (
		<>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
				{items.map((item) => (
					<StockCard
						key={item.symbol}
						data={item}
						onClick={setSelectedSymbol}
					/>
				))}
			</div>

			{/* TODO: For stock, we don't have real-time data, so it shouldn't show the dialog */}
			{/* TODO: For crypto, if it includes in the daily_analysis table, we should show the kline by Binance WebSocket */}
			<Dialog open={!!selectedSymbol} onOpenChange={(open) => !open && setSelectedSymbol(null)}>
				<DialogContent className="max-w-4xl h-[600px] flex flex-col">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							{selectedItem?.name}
							<span className="text-muted-foreground text-sm">({selectedItem?.symbol})</span>
						</DialogTitle>
						<DialogDescription>
							Daily Chart
						</DialogDescription>
					</DialogHeader>

					<div className="flex-1 w-full min-h-0 bg-background border rounded-md overflow-hidden">
						{/* Prevent unnecessary API calls by conditionally rendering the KLine chart */}
						{selectedSymbol && (
							<KLineWrapper symbol={selectedSymbol} />
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}
