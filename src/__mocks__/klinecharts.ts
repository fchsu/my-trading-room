
import { vi } from 'vitest'

export const dispose = vi.fn()

export const init = vi.fn(() => ({
  applyNewData: vi.fn(),
  resize: vi.fn(),
  setStyleOptions: vi.fn(),
}))

export default {
  init,
  dispose,
}
