-- 1. Create the expenses table (Modified: removed idempotency_key)
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create the idempotency_keys table (New: separate table)
CREATE TABLE idempotency_keys (
  key TEXT PRIMARY KEY,
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Note: enable uuid-ossp extension if not enabled
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
