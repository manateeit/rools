-- Trading AI Agent Bot - Supabase Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role TEXT NOT NULL DEFAULT 'user',
  preferences JSONB DEFAULT '{}'
);

-- API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  encrypted_secret TEXT NOT NULL,
  is_paper BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trades Table
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  order_id TEXT,
  status TEXT NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  strategy TEXT,
  model_id TEXT,
  is_paper BOOLEAN DEFAULT TRUE
);

-- Backtests Table
CREATE TABLE IF NOT EXISTS backtests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  strategy TEXT NOT NULL,
  parameters JSONB NOT NULL,
  symbols TEXT[] NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  results JSONB,
  metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  model_id TEXT
);

-- Model Performance Table
CREATE TABLE IF NOT EXISTS model_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,
  decision_type TEXT NOT NULL,
  decision JSONB NOT NULL,
  outcome JSONB,
  accuracy NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  symbol TEXT,
  context JSONB
);

-- Strategy Executions Table
CREATE TABLE IF NOT EXISTS strategy_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  strategy JSONB NOT NULL,
  assets TEXT[] NOT NULL,
  decisions JSONB NOT NULL,
  results JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE backtests ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_executions ENABLE ROW LEVEL SECURITY;

-- Users Policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- API Keys Policies
CREATE POLICY "Users can view their own API keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API keys" ON api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" ON api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" ON api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- Trades Policies
CREATE POLICY "Users can view their own trades" ON trades
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trades" ON trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Backtests Policies
CREATE POLICY "Users can view their own backtests" ON backtests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own backtests" ON backtests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own backtests" ON backtests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own backtests" ON backtests
  FOR DELETE USING (auth.uid() = user_id);

-- Model Performance Policies
CREATE POLICY "Users can view their own model performance data" ON model_performance
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own model performance data" ON model_performance
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Strategy Executions Policies
CREATE POLICY "Users can view their own strategy executions" ON strategy_executions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own strategy executions" ON strategy_executions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for Performance

-- API Keys Indexes
CREATE INDEX api_keys_user_id_idx ON api_keys (user_id);
CREATE INDEX api_keys_provider_idx ON api_keys (provider);

-- Trades Indexes
CREATE INDEX trades_user_id_idx ON trades (user_id);
CREATE INDEX trades_symbol_idx ON trades (symbol);
CREATE INDEX trades_executed_at_idx ON trades (executed_at);
CREATE INDEX trades_created_at_idx ON trades (created_at);
CREATE INDEX trades_strategy_idx ON trades (strategy);
CREATE INDEX trades_model_id_idx ON trades (model_id);

-- Backtests Indexes
CREATE INDEX backtests_user_id_idx ON backtests (user_id);
CREATE INDEX backtests_created_at_idx ON backtests (created_at);
CREATE INDEX backtests_model_id_idx ON backtests (model_id);

-- Model Performance Indexes
CREATE INDEX model_performance_user_id_idx ON model_performance (user_id);
CREATE INDEX model_performance_model_id_idx ON model_performance (model_id);
CREATE INDEX model_performance_decision_type_idx ON model_performance (decision_type);
CREATE INDEX model_performance_created_at_idx ON model_performance (created_at);
CREATE INDEX model_performance_symbol_idx ON model_performance (symbol);

-- Strategy Executions Indexes
CREATE INDEX strategy_executions_user_id_idx ON strategy_executions (user_id);
CREATE INDEX strategy_executions_timestamp_idx ON strategy_executions (timestamp);