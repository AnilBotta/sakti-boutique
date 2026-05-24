-- Auto-create a customer profile on every new auth.users row.
--
-- When a visitor signs up via /login the storefront's signUpAction calls
-- supabase.auth.signUp() which inserts into auth.users. This trigger
-- mirrors that insert into public.customers so every customer-facing
-- query (orders, addresses, wishlist) can join on customer_id from
-- day one.
--
-- Guardrails:
--   * Admin accounts (app_metadata.role = 'admin') skip this — admin
--     users belong in the admin console, not the customer table.
--   * `on conflict do nothing` keeps this idempotent across replays
--     (e.g. a backfill run, or a duplicate trigger from staging).
--   * SECURITY DEFINER lets the trigger function bypass RLS so the
--     write succeeds even though auth.uid() isn't set during signup.

create or replace function public.handle_new_customer_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := coalesce(new.raw_app_meta_data->>'role', '');
  v_full_name text := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    null
  );
begin
  -- Don't shadow staff accounts with customer profiles.
  if v_role = 'admin' then
    return new;
  end if;

  -- Only create a profile if the auth user has a usable email. Magic-link
  -- / SSO flows that don't expose an email will be backfilled later.
  if new.email is null or new.email = '' then
    return new;
  end if;

  insert into public.customers (auth_user_id, email, full_name)
  values (new.id, new.email, v_full_name)
  on conflict (auth_user_id) do nothing;

  return new;
end;
$$;

-- Re-create cleanly each run so the trigger picks up any function changes.
drop trigger if exists on_auth_user_created_create_customer on auth.users;
create trigger on_auth_user_created_create_customer
  after insert on auth.users
  for each row execute function public.handle_new_customer_profile();
