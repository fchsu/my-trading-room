import { describe, it, expect } from 'vitest'
import { analyzeStock } from '@/lib/strategy/brokenBottom'
import { KLineData } from 'klinecharts'

// Helper to generate simple candles
// Using exact price for High/Low/Close to ensure assertions are precise
function createCandle(i: number, price: number): KLineData {
  return {
    timestamp: i * 1000,
    open: price,
    high: price,
    low: price,
    close: price,
    volume: 1000,
    turnover: 1000
  }
}

// Generate a sequence of candles connecting pivot points linearly
function generatePattern(pivots: number[]): KLineData[] {
  const candles: KLineData[] = []
  let time = 0

  for (let i = 0; i < pivots.length - 1; i++) {
    const start = pivots[i]
    const end = pivots[i + 1]
    const steps = 5 // candles between pivots

    for (let j = 0; j < steps; j++) {
      const price = start + (end - start) * (j / steps)
      candles.push(createCandle(time++, price))
    }
  }
  const lastPrice = pivots[pivots.length - 1]
  candles.push(createCandle(time++, lastPrice))
  return candles
}

describe('Strategy: brokenBottom (2B Pattern)', () => {

  // P0(H) -> P1(L) -> P2(H) -> P3(L) -> P4(H) -> Current
  // P1 = Support = 100
  // P3 = Fakeout = 95 ( < 100)
  // P4 = Rebound = 110 ( > 100)
  // Current = Retest = 101 (approx 100)

  it('identifies a perfect 2B pattern', () => {
    // Pattern: 120 -> 100 -> 115 -> 95 -> 110 -> 101
    const p0 = 120
    const p1 = 100 // Support
    const p2 = 115
    const p3 = 95  // Fake Breakout
    const p4 = 110 // Reclaim
    const current = 101 // Retest

    const data = generatePattern([110, p0, p1, p2, p3, p4, current])

    const result = analyzeStock('TEST_PERFECT', data)

    if (!result.matched) {
      console.log('Test Failed Reasons:', result.reason)
    }

    expect(result.matched).toBe(true)
    // Assert exact values
    expect(result.debugInfo?.p1_support).toBe(100)
    expect(result.debugInfo?.p3_fake_breakout).toBe(95)
    expect(result.debugInfo?.p4_rebound).toBe(110)

    // Check pivot sequence logic
    expect(result.debugInfo?.pivots[1].price).toBe(100) // P1
    expect(result.debugInfo?.pivots[3].price).toBe(95)  // P3
  })

  it('identifies 2B pattern with formed P5 (Low)', () => {
    // Pattern: P0(120)->P1(100)->P2(115)->P3(95)->P4(110)->P5(100.5)->Current(101)
    // P5 is 100.5 (within 2% of 100).

    const data = generatePattern([110, 120, 100, 115, 95, 110, 100.5, 101])

    const result = analyzeStock('P5-FORMED', data)

    expect(result.matched).toBe(true)
    expect(result.debugInfo?.p1_support).toBe(100)
    expect(result.debugInfo?.pivots.length).toBe(6) // P0-P5
    expect(result.debugInfo?.pivots[5].price).toBe(100.5) // P5
  })

  it('fails if P5 is present but outside tolerance', () => {
    // P5 = 97 ( < 100 - 2% ), too low
    // While Current = 101 (Valid retest). 
    // This forces the logic to pass "Current Price" check but fail "P5" check.
    const data = generatePattern([110, 120, 100, 115, 95, 110, 97, 101])

    const result = analyzeStock('P5-FAIL', data)

    expect(result.matched).toBe(false)
    expect(result.reason.some(r => r.includes('P5 Low not touching support'))).toBe(true)
  })

  it('fails if P3 does not break P1 (W Bottom)', () => {
    // P3 = 100 (Same as P1) -> Not a "Broken" bottom
    const data = generatePattern([110, 120, 100, 115, 100, 110, 101])
    const result = analyzeStock('W-BOTTOM', data)
    expect(result.matched).toBe(false)
    expect(result.reason.some(r => r.includes('No fake breakout'))).toBe(true)
  })

  it('fails if P4 does not reclaim P1 (Weak Rebound)', () => {
    // P4 = 98 ( < 100 )
    const data = generatePattern([110, 120, 100, 115, 95, 98, 96])
    const result = analyzeStock('WEAK', data)
    expect(result.matched).toBe(false)
    expect(result.reason.some(r => r.includes('Weak rebound'))).toBe(true)
  })

  it('fails if current price is chasing high ( > P4)', () => {
    // Current = 112 ( > P4=110)
    // Need a dip to confirm P4 as High: 110 -> 108 -> 112
    const data = generatePattern([110, 120, 100, 115, 95, 110, 108, 112])
    const result = analyzeStock('CHASE', data)
    expect(result.matched).toBe(false)
    expect(result.reason.some(r => r.includes('Price too high'))).toBe(true)
  })

  it('fails if current price is too far from support ( > Tolerance)', () => {
    // Current = 105 ( > 100 + 2%)
    const data = generatePattern([110, 120, 100, 115, 95, 110, 105])
    const result = analyzeStock('FAR', data)
    expect(result.matched).toBe(false)
    expect(result.reason.some(r => r.includes('Price not close enough'))).toBe(true)
  })

})

