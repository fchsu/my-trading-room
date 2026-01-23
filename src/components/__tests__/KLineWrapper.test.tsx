
import { render } from '@testing-library/react'
import { KLineWrapper } from '../charts/KLineWrapper'
import { vi } from 'vitest'
import * as klinecharts from 'klinecharts'

const mockApplyNewData = vi.fn()

// Mock the klinecharts module
vi.mock('klinecharts', () => ({
  init: vi.fn(() => ({
    applyNewData: mockApplyNewData,
    resize: vi.fn(),
    setStyleOptions: vi.fn(),
  })),
  dispose: vi.fn()
}))

describe('KLineWrapper Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes chart on mount', () => {
    render(<KLineWrapper symbol="AAPL" />)
    expect(klinecharts.init).toHaveBeenCalled()
    expect(mockApplyNewData).toHaveBeenCalled()
  })

  it('disposes chart on unmount', () => {
    const { unmount } = render(<KLineWrapper symbol="AAPL" />)
    unmount()
    expect(klinecharts.dispose).toHaveBeenCalled()
  })

  it('re-initializes data but DOES NOT re-init chart when symbol changes', () => {
    const { rerender } = render(<KLineWrapper symbol="AAPL" />)
    expect(klinecharts.init).toHaveBeenCalledTimes(1)
    expect(mockApplyNewData).toHaveBeenCalledTimes(1)

    // Change symbol
    rerender(<KLineWrapper symbol="TSLA" />)

    // Should NOT dispose and re-init, just update data
    expect(klinecharts.dispose).not.toHaveBeenCalled()
    expect(klinecharts.init).toHaveBeenCalledTimes(1)
    expect(mockApplyNewData).toHaveBeenCalledTimes(2)
  })

  it('updates data when initialData changes without re-init chart', () => {
    const data1 = [{ timestamp: 1000, open: 10, high: 12, low: 9, close: 11, volume: 100 }]
    const data2 = [{ timestamp: 2000, open: 11, high: 13, low: 10, close: 12, volume: 200 }]

    const { rerender } = render(<KLineWrapper symbol="AAPL" initialData={data1} />)
    expect(mockApplyNewData).toHaveBeenCalledWith(data1)

    rerender(<KLineWrapper symbol="AAPL" initialData={data2} />)
    expect(mockApplyNewData).toHaveBeenCalledWith(data2)

    expect(klinecharts.init).toHaveBeenCalledTimes(1) // Still 1
  })

})
