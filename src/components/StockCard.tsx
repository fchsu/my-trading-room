
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { StockCardData } from "@/types"

interface StockCardProps {
	data: StockCardData
	onClick: (symbol: string) => void
}

export function StockCard({ data, onClick }: StockCardProps) {
	const isPositive = data.change >= 0

	return (
		<Card
			className="cursor-pointer hover:bg-accent/50 transition-colors shadow-sm hover:shadow-md"
			onClick={() => onClick(data.symbol)}
		>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">
					{data.symbol}
				</CardTitle>
				<span className={cn(
					"text-sm font-bold",
					isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
				)}>
					{isPositive ? "+" : "-"}{data.change.toFixed(2)}%
				</span>
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{data.price.toFixed(2)}</div>
				<div className="flex flex-wrap gap-1 mt-2">
					<p className="text-xs text-muted-foreground w-full mb-1">
						Vol: {data.volumeStr}
					</p>
					{data.tags.map((tag) => (
						<Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0 h-5">
							{tag}
						</Badge>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
