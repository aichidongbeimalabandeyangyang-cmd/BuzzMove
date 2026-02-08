-- Atomic credit deduction: checks balance and deducts in one operation
-- Raises INSUFFICIENT_CREDITS if balance is too low
create or replace function public.deduct_credits(p_user_id uuid, p_amount integer)
returns integer
language plpgsql
security definer
as $$
declare
  v_new_balance integer;
begin
  update public.profiles
  set credits_balance = credits_balance - p_amount,
      updated_at = now()
  where id = p_user_id
    and credits_balance >= p_amount
  returning credits_balance into v_new_balance;

  if not found then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;

  return v_new_balance;
end;
$$;

-- Atomic credit refund
create or replace function public.refund_credits(p_user_id uuid, p_amount integer)
returns integer
language plpgsql
security definer
as $$
declare
  v_new_balance integer;
begin
  update public.profiles
  set credits_balance = credits_balance + p_amount,
      updated_at = now()
  where id = p_user_id
  returning credits_balance into v_new_balance;

  return v_new_balance;
end;
$$;
