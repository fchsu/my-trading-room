
import { render, screen, fireEvent } from '@testing-library/react'
import { StockCard } from '../StockCard'
import { StockCardData } from '@/types'
import { vi } from 'vitest'

const mockStock: StockCardData = {
  symbol: 'TSLA',
  name: 'Tesla Inc',
  price: 250.50,
  change: 1.25,
  volumeStr: '10M',
  tags: ['EV', 'Tech']
}

describe('StockCard Component', () => {
  it('renders stock information correctly', () => {
    render(<StockCard data={mockStock} onClick={() => { }} />)

    expect(screen.getByText('TSLA')).toBeInTheDocument()
    expect(screen.getByText('250.50')).toBeInTheDocument()
    expect(screen.getByText('+1.25%')).toBeInTheDocument()
    expect(screen.getByText('Vol: 10M')).toBeInTheDocument()
  })

  it('renders tags', () => {
    render(<StockCard data={mockStock} onClick={() => { }} />)
    expect(screen.getByText('EV')).toBeInTheDocument()
    expect(screen.getByText('Tech')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<StockCard data={mockStock} onClick={handleClick} />)

    fireEvent.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
    expect(handleClick).toHaveBeenCalledWith('TSLA')
  })

  it('displays red color for negative change', () => {
    const negativeStock = { ...mockStock, change: -5.0 }
    render(<StockCard data={negativeStock} onClick={() => { }} />)

    const priceElement = screen.getByText('-5.00%')
    expect(priceElement).toHaveClass('text-red-600')
  })

  it('displays green color for positive change', () => {
    render(<StockCard data={mockStock} onClick={() => { }} />)
    const priceElement = screen.getByText('+1.25%')
    expect(priceElement).toHaveClass('text-green-600')
  })
})
