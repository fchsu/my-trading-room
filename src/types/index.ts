/**
 * @file index.ts
 * @description Shared TypeScript interfaces and enums for the trading application.
 * Includes definitions for Market Data, Order Management, and Analysis.
 */
export enum MarketType {
  US = 'US',
  TW_SE = 'TW_SE', // Taiwan Stock Exchange (Listed)
  TW_OTC = 'TW_OTC', // Taipei Exchange (OTC)
  CRYPTO = 'CRYPTO',
}

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  FILLED = 'FILLED',
  CANCELED = 'CANCELED',
}

export interface TickerInfo {
  symbol: string;
  name: string;
  market: MarketType;
  sector?: string;
  is_active: boolean;
  last_updated_at: string;
}

export interface DailyAnalysis {
  id: string;
  ticker: string;
  market: MarketType;
  date: string;
  close_price: number;
  change_percent: number;
  volume: number;
  market_cap?: number;
  strategy_tags?: string[];
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price: string;
  quantity: string;
  status: OrderStatus;
  filled_average_price?: string;
  created_at: string;
}

export interface Position {
  id: string;
  user_id: string;
  symbol: string;
  side: OrderSide;
  avg_entry_price: string;
  quantity: string;
  updated_at: string;
}

export interface StockCardData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volumeStr: string;
  tags: string[];
}
