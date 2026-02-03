import { KLineData } from 'klinecharts'

export function generateMockKLines(symbol: string): KLineData[] {
  const candles: KLineData[] = []
  let time = new Date().setHours(0, 0, 0, 0)
  // Backfill 200 days
  time -= 200 * 24 * 60 * 60 * 1000

  // Create a seeded random generator based on symbol string
  let seed = 0
  for (let i = 0; i < symbol.length; i++) {
    seed = (seed << 5) - seed + symbol.charCodeAt(i)
    seed |= 0 // Convert to 32bit integer
  }

  // Simple LCG (Linear Congruential Generator)
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }

  if (symbol === '2330.TW' || symbol === 'AAPL' || symbol === '2317.TW') {
    // Generate a perfect 2B pattern
    // P0(H) -> P1(L) -> P2(H) -> P3(L, Fake Break) -> P4(H, Rebound) -> Current(Retest P1)

    // 1. Random noise before pattern
    let price = 100
    for (let i = 0; i < 50; i++) {
      price += (random() - 0.5) * 2
      candles.push({
        timestamp: time += 24 * 60 * 60 * 1000,
        open: price, high: price + 1, low: price - 1, close: price,
        volume: 500 + random() * 500, turnover: 500
      })
    }

    // 2. Construct Pattern Points
    const p0_price = 110
    const p1_price = 90  // Support
    const p2_price = 105
    const p3_price = 85  // Fake Breakout
    const p4_price = 100 // Strong Rebound
    const current_price = 91 // Retest P1 (within tolerance: 90 * 0.02 = 1.8. |91-90|=1 < 1.8)

    const points = [p0_price, p1_price, p2_price, p3_price, p4_price, current_price]

    // Interpolate between points
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i]
      const end = points[i + 1]
      const steps = 5
      for (let j = 0; j <= steps; j++) {
        const price = start + (end - start) * (j / steps)
        candles.push({
          timestamp: time += 24 * 60 * 60 * 1000,
          open: price, high: price + 0.5, low: price - 0.5, close: price,
          volume: 1000, turnover: 1000
        })
      }
    }
  } else {
    // Random walk - unlikely to match, but CONSISTENT per symbol now
    let price = 100
    for (let i = 0; i < 100; i++) {
      price += (random() - 0.5) * 5
      candles.push({
        timestamp: time += 24 * 60 * 60 * 1000,
        open: price, high: price + 1, low: price - 1, close: price,
        volume: 500, turnover: 500
      })
    }
  }

  return candles
}
