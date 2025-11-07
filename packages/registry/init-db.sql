-- Agent Registry Database Schema
-- Run this to initialize the database

CREATE TABLE IF NOT EXISTS agents (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(50),
  endpoint VARCHAR(500) NOT NULL,
  wallet_address VARCHAR(255) NOT NULL,
  capabilities JSONB NOT NULL,
  tags TEXT[],
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_heartbeat TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_agents_tags ON agents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_agents_capabilities ON agents USING GIN(capabilities);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_wallet ON agents(wallet_address);
CREATE INDEX IF NOT EXISTS idx_agents_name ON agents(name);
CREATE INDEX IF NOT EXISTS idx_agents_heartbeat ON agents(last_heartbeat);

-- Optional: Add full-text search
CREATE INDEX IF NOT EXISTS idx_agents_name_search ON agents USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_agents_desc_search ON agents USING gin(to_tsvector('english', description));

COMMENT ON TABLE agents IS 'Registry of all x402-enabled agents';
COMMENT ON COLUMN agents.id IS 'Unique agent identifier';
COMMENT ON COLUMN agents.wallet_address IS 'Solana wallet address for payments';
COMMENT ON COLUMN agents.capabilities IS 'JSON array of agent capabilities and pricing';
COMMENT ON COLUMN agents.tags IS 'Array of searchable tags';
COMMENT ON COLUMN agents.status IS 'Agent status: active or inactive';
COMMENT ON COLUMN agents.last_heartbeat IS 'Last time agent sent heartbeat signal';

