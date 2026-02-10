-- Anti-abuse: device fingerprint rate limiting + disposable email defense
-- 1. Track signups per device fingerprint
-- 2. Change trigger to give 0 credits by default (credits granted after device check)
-- 3. RPC function to claim signup credits with device_key validation

-- ============================================================
-- 1. signup_device_log table
-- ============================================================
CREATE TABLE public.signup_device_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_key text NOT NULL,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sdl_device_key ON public.signup_device_log(device_key);
CREATE UNIQUE INDEX idx_sdl_user_id ON public.signup_device_log(user_id);

ALTER TABLE public.signup_device_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON public.signup_device_log
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- 2. Update handle_new_user trigger: 0 credits by default
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits_balance, referral_code)
  VALUES (new.id, new.email, 0, public.generate_referral_code(8));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 3. claim_signup_credits RPC (idempotent, race-safe)
-- ============================================================
-- Pre-populate signup_device_log for all existing users
-- so they won't get extra credits after this migration (fixes issue #2)
INSERT INTO public.signup_device_log (device_key, user_id)
SELECT COALESCE(device_key, 'legacy_' || id::text), id
FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.claim_signup_credits(
  p_user_id uuid,
  p_device_key text,
  p_ip_address text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rows_inserted integer;
  v_device_count integer;
  v_credits_to_grant integer;
  v_new_balance integer;
BEGIN
  -- 1. Attempt to insert into signup_device_log (atomic idempotency via UNIQUE index)
  --    This is the single source of truth — if INSERT succeeds, this is a new claim.
  --    If it conflicts, user already claimed. No race condition possible.
  INSERT INTO public.signup_device_log (device_key, user_id, ip_address)
  VALUES (p_device_key, p_user_id, p_ip_address)
  ON CONFLICT (user_id) DO NOTHING;

  GET DIAGNOSTICS v_rows_inserted = ROW_COUNT;

  IF v_rows_inserted = 0 THEN
    -- Already claimed, return current balance
    SELECT credits_balance INTO v_new_balance
    FROM public.profiles WHERE id = p_user_id;
    RETURN COALESCE(v_new_balance, 0);
  END IF;

  -- 2. Count existing signups from this device (excluding the one we just inserted)
  SELECT COUNT(*) - 1 INTO v_device_count
  FROM public.signup_device_log
  WHERE device_key = p_device_key;

  -- 3. First 2 accounts per device get 200 credits; 3rd+ get 0
  IF v_device_count < 2 THEN
    v_credits_to_grant := 200;
  ELSE
    v_credits_to_grant := 0;
  END IF;

  -- 4. Grant credits if eligible
  IF v_credits_to_grant > 0 THEN
    UPDATE public.profiles
    SET credits_balance = credits_balance + v_credits_to_grant,
        updated_at = now()
    WHERE id = p_user_id
    RETURNING credits_balance INTO v_new_balance;

    INSERT INTO public.credit_transactions (user_id, amount, type, description)
    VALUES (p_user_id, v_credits_to_grant, 'signup_bonus', 'Free signup credits');
  ELSE
    SELECT credits_balance INTO v_new_balance
    FROM public.profiles WHERE id = p_user_id;
  END IF;

  RETURN COALESCE(v_new_balance, 0);
END;
$$;
