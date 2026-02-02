-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Tickers Main Table: The "Product Catalog" of available stocks.
create table if not exists tickers (
  symbol text primary key,                  -- Stock symbol (Primary Key).
  name text,                                -- Stock name (e.g., "Apple Inc.").
  market text not null,                     -- Market type (e.g., "US", "TW_SE").
  sector text,                              -- Sector category (e.g., "Technology").
  is_active boolean default true,           -- Active status. Set to false if delisted.
  last_updated_at timestamptz default now() -- Last update timestamp.
);

-- Index for market and active status to accelerate filtering active stocks by market.
create index if not exists idx_tickers_market_active on tickers(market, is_active);

-- 2. Daily Analysis Results Table: Records daily automated scanning results.
create table if not exists daily_analysis (
  id uuid default uuid_generate_v4() primary key,   -- Unique identifier.
  ticker text not null references tickers(symbol),  -- Stock symbol referencing the tickers table.
  market text not null,                             -- Market type.
  date date not null default CURRENT_DATE,          -- Date of analysis.
  close_price numeric,                              -- Closing price (precise numeric type).
  change_percent numeric,                           -- Percentage change.
  volume numeric,                                   -- Trading volume.
  market_cap numeric,                               -- Market capitalization.
  strategy_tags text[],                             -- Array of strategy tags (e.g., ["VOLUME_SPIKE"]).
  created_at timestamptz default now()              -- Creation timestamp.
);

-- Index for date and market for faster screening historical results.
create index if not exists idx_daily_analysis_date_market on daily_analysis(date, market);

-- [NEW] Unique constraint to allow idempotent upserts on (ticker, date).
do $$ 
begin
  if not exists (
    select 1 from pg_constraint where conname = 'daily_analysis_ticker_date_key'
  ) then
    alter table daily_analysis add constraint daily_analysis_ticker_date_key unique (ticker, date);
  end if;
end $$;

-- 3. User Profiles: Stores per-user data like wallet balance.
create table if not exists profiles (
  id uuid references auth.users not null primary key, -- User ID mapping to Supabase Auth.
  email text,                                         -- User email.
  balance numeric default 100000,                     -- Virtual wallet balance (default $100k).
  created_at timestamptz default now()
);

-- 4. Simulated Trading Orders Table: Log of all order requests.
create table if not exists orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  symbol text not null,                                                                       -- Kept as text (no ref) to retain history if ticker is deleted.
  side text not null check (side in ('BUY', 'SELL')),                                         -- BUY or SELL.
  type text not null check (type in ('MARKET', 'LIMIT')),                                     -- MARKET or LIMIT.
  price numeric not null,
  quantity numeric not null,
  status text not null check (status in ('PENDING', 'FILLED', 'CANCELED')) default 'PENDING', -- Order status.
  filled_average_price numeric,
  created_at timestamptz default now()
);

-- Index for user order history sorting.
create index if not exists idx_orders_user_created on orders(user_id, created_at desc);

-- 5. Positions Table: Current stock holdings per user.
create table if not exists positions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  symbol text not null,
  side text not null check (side in ('BUY', 'SELL')),
  avg_entry_price numeric not null,
  quantity numeric not null,
  updated_at timestamptz default now(),
  unique(user_id, symbol, side) -- Ensures a single row per user-stock-side combination.
);

-- 6. Daily Balance Snapshots: Historical snapshots of user portfolio value.
create table if not exists daily_balance_snapshots (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  date date not null default CURRENT_DATE,
  total_equity numeric not null,
  total_balance numeric not null,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- RLS Security Settings
alter table profiles enable row level security;
alter table orders enable row level security;
alter table positions enable row level security;
alter table daily_balance_snapshots enable row level security;
alter table tickers enable row level security;
alter table daily_analysis enable row level security;

-- Policies (Idempotent creation)
do $$ 
begin
  if not exists (select 1 from pg_policies where policyname = 'Users can view own profile') then
    create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
  end if;
  
  if not exists (select 1 from pg_policies where policyname = 'Users can update own profile') then
    create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Users can CRUD own orders') then
    create policy "Users can CRUD own orders" on orders for all using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Users can CRUD own positions') then
    create policy "Users can CRUD own positions" on positions for all using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Users can read own snapshots') then
    create policy "Users can read own snapshots" on daily_balance_snapshots for select using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Public read tickers') then
    create policy "Public read tickers" on tickers for select using (true);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Public read analysis') then
    create policy "Public read analysis" on daily_analysis for select using (true);
  end if;
end $$;
