-- Layer 1: Event ID dedup table
CREATE TABLE IF NOT EXISTS processed_stripe_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_processed_stripe_events_processed_at 
  ON processed_stripe_events (processed_at);

-- Layer 3: UNIQUE partial index on credit_transactions.stripe_payment_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_transactions_unique_stripe_payment 
  ON credit_transactions (stripe_payment_id) 
  WHERE stripe_payment_id IS NOT NULL;

-- RLS on new table
ALTER TABLE processed_stripe_events ENABLE ROW LEVEL SECURITY;
