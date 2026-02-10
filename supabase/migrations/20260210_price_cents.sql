ALTER TABLE public.credit_transactions
ADD COLUMN IF NOT EXISTS price_cents integer;
