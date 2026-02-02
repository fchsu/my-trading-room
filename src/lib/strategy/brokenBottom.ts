import { KLineData } from 'klinecharts'

export interface Pivot {
  index: number
  price: number
  type: 'HIGH' | 'LOW'
  timestamp: number
}

export interface ScreenResult {
  symbol: string
  matched: boolean
  reason: string[]
  debugInfo?: {
    pivots: Pivot[]
    currentPrice: number
    p1_support: number
    p3_fake_breakout: number
    p4_rebound: number
  }
}

const CONFIG = {
  zigzagDepth: 3, // High/Low must be extreme of +/- 3 candles
  retestTolerance: 0.02 // 2% tolerance for re-testing P1
}

/**
 * Finds pivots (High/Low points) using a ZigZag-like approach.
 * A High is defined if High[i] is the highest among [i-depth, i+depth].
 * A Low is defined if Low[i] is the lowest among [i-depth, i+depth].
 */
export function findPivots(candles: KLineData[], depth: number = CONFIG.zigzagDepth): Pivot[] {
  const pivots: Pivot[] = []

  for (let i = depth; i < candles.length - depth; i++) {
    const currentHigh = candles[i].high
    const currentLow = candles[i].low
    const currentTimestamp = candles[i].timestamp

    // Check for High
    let isHigh = true
    for (let k = 1; k <= depth; k++) {
      if (candles[i - k].high > currentHigh || candles[i + k].high > currentHigh) {
        isHigh = false
        break
      }
    }

    // Check for Low
    let isLow = true
    for (let k = 1; k <= depth; k++) {
      if (candles[i - k].low < currentLow || candles[i + k].low < currentLow) {
        isLow = false
        break
      }
    }

    // Determine type (if both, decide logic - usually simpler to store both or prioritize one. Here we store both if happens, logic filters later)
    if (isHigh) {
      pivots.push({ index: i, price: currentHigh, type: 'HIGH', timestamp: currentTimestamp })
    }
    if (isLow) {
      pivots.push({ index: i, price: currentLow, type: 'LOW', timestamp: currentTimestamp })
    }
  }

  // Filter to ensure strict Alternation: High -> Low -> High -> Low
  // Simple approach: Iterate and merge consecutive Highs (take max) / Lows (take min)
  return ensureAlternation(pivots)
}

function ensureAlternation(rawPivots: Pivot[]): Pivot[] {
  if (rawPivots.length === 0) return []

  const cleanPivots: Pivot[] = []
  let pendingPivot = rawPivots[0]

  for (let i = 1; i < rawPivots.length; i++) {
    const current = rawPivots[i]

    if (current.type !== pendingPivot.type) {
      // Type switched, commit pending and start new
      cleanPivots.push(pendingPivot)
      pendingPivot = current
    } else {
      // Same type, update pending if "better" (Higher High or Lower Low)
      if (current.type === 'HIGH') {
        if (current.price > pendingPivot.price) pendingPivot = current
      } else {
        if (current.price < pendingPivot.price) pendingPivot = current
      }
    }
  }
  cleanPivots.push(pendingPivot)
  return cleanPivots
}

/**
 * Analyzes stock data for "2B Pattern" (Broken Bottom / False Breakout).
 * Pattern: P0(H) -> P1(L, Support) -> P2(H) -> P3(L, Fake Break < P1) -> P4(H, Rebound > P1)
 * Entry Condition: Current Price is re-testing P1 (approx P1).
 */
export function analyzeStock(symbol: string, candles: KLineData[]): ScreenResult {
  const result: ScreenResult = { symbol, matched: false, reason: [] }

  // 1. Need at least enough candles
  if (candles.length < 20) {
    result.reason.push('Not enough data')
    return result
  }

  // 2. Identify Pivots
  const pivots = findPivots(candles)

  if (pivots.length < 5) {
    result.reason.push('Not enough pivots identified')
    return result
  }

  // 3. Determine Pattern Mapping based on Last Pivot
  const lastPivot = pivots[pivots.length - 1]

  let p0: Pivot, p1: Pivot, p2: Pivot, p3: Pivot, p4: Pivot
  let p5: Pivot | undefined

  if (lastPivot.type === 'HIGH') {
    // Case A: Last pivot is P4 (High). Structure: P0(H)->P1(L)->P2(H)->P3(L)->P4(H) -> Current
    if (pivots.length < 5) {
      result.reason.push('Not enough pivots for P4-ending pattern')
      return result
    }
    p4 = pivots[pivots.length - 1]
    p3 = pivots[pivots.length - 2]
    p2 = pivots[pivots.length - 3]
    p1 = pivots[pivots.length - 4]
    p0 = pivots[pivots.length - 5]
  } else {
    // Case B: Last pivot is P5 (Low). Structure: P0(H)->P1(L)->P2(H)->P3(L)->P4(H)->P5(L) -> Current
    // P5 must be within tolerance of P1
    if (pivots.length < 6) {
      result.reason.push('Not enough pivots for P5-ending pattern')
      return result
    }
    p5 = pivots[pivots.length - 1]
    p4 = pivots[pivots.length - 2]
    p3 = pivots[pivots.length - 3]
    p2 = pivots[pivots.length - 4]
    p1 = pivots[pivots.length - 5]
    p0 = pivots[pivots.length - 6]
  }

  // 4. Validate Pattern Structure Types
  if (p4.type !== 'HIGH' || p3.type !== 'LOW' || p2.type !== 'HIGH' || p1.type !== 'LOW' || p0.type !== 'HIGH') {
    result.reason.push('Pivot types mismatch (Expect ...H-L-H-L-H...)')
    return result
  }

  const supportPrice = p1.price
  const tolerancePrice = supportPrice * CONFIG.retestTolerance

  // 5. Logic Validation

  // (A) Check Fake Breakout: P3 < P1 (Strictly lower)
  if (p3.price >= supportPrice) {
    result.reason.push(`No fake breakout: P3(${p3.price}) >= P1(${supportPrice})`)
    return result
  }

  // (B) Check Strong Rebound: P4 > P1 (Must reclaim)
  if (p4.price <= supportPrice) {
    result.reason.push(`Weak rebound: P4(${p4.price}) did not reclaim P1(${supportPrice})`)
    return result
  }

  // (C) Check Current Status
  const currentPrice = candles[candles.length - 1].close

  // (D) Price "Chasing" Check
  // Current Price should strictly be lower than P4 (otherwise we are chasing a breakout)
  if (currentPrice >= p4.price) {
    result.reason.push(`Price too high (Chasing): Current(${currentPrice}) > P4(${p4.price})`)
    return result
  }

  // (E) Re-test Check (Proximity to P1)
  // Check 1: Current Price vs P1
  const diffCurrent = Math.abs(currentPrice - supportPrice)

  if (diffCurrent > tolerancePrice) {
    if (currentPrice < supportPrice) {
      result.reason.push(`Price failed support again: Current(${currentPrice}) << P1`)
    } else {
      result.reason.push(`Price not close enough to support: Current(${currentPrice}) >> P1`)
    }
    return result
  }

  // (F) If P5 exists, it must ALSO be within tolerance of P1
  if (p5) {
    const diffP5 = Math.abs(p5.price - supportPrice)
    if (diffP5 > tolerancePrice) {
      result.reason.push(`P5 Low not touching support: P5(${p5.price}) vs P1(${supportPrice})`)
      return result
    }
  }

  // Passed All Checks
  result.matched = true
  result.debugInfo = {
    pivots: p5 ? [p0, p1, p2, p3, p4, p5] : [p0, p1, p2, p3, p4],
    currentPrice,
    p1_support: supportPrice,
    p3_fake_breakout: p3.price,
    p4_rebound: p4.price
  }

  return result
}
