-- Fix: referral codes were using left(uuid, 8) which is predictable and collision-prone.
-- Switch to 8 random alphanumeric characters for better entropy.

-- 1. Helper function to generate random alphanumeric codes
CREATE OR REPLACE FUNCTION public.generate_referral_code(length integer DEFAULT 8)
RETURNS text AS $$
DECLARE
  chars text := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 2. Regenerate existing referral codes with random values
UPDATE public.profiles
SET referral_code = public.generate_referral_code(8)
WHERE referral_code IS NOT NULL;

-- 3. Update the trigger to use random codes for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits_balance, referral_code)
  VALUES (new.id, new.email, 200, public.generate_referral_code(8));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
