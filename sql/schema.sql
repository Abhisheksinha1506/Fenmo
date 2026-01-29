-- Create the expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  idempotency_key TEXT UNIQUE
);

-- Note: enable uuid-ossp extension if not enabled
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
