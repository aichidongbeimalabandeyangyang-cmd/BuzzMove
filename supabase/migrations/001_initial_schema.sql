-- VibeVideo Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- User profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text,
  avatar_url text,
  stripe_customer_id text unique,
  subscription_plan text not null default 'free',
  subscription_status text not null default 'active',
  credits_balance integer not null default 9000,
  daily_free_credits integer not null default 300,
  device_key text,
  initial_utm_source text,
  initial_utm_campaign text,
  initial_ref text,
  content_policy text not null default 'strict',
  country_code text,
  timezone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Videos
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kling_task_id text,
  status text not null default 'pending',
  input_image_url text not null,
  prompt text,
  duration integer not null default 5,
  mode text not null default 'standard',
  aspect_ratio text not null default '9:16',
  output_video_url text,
  output_video_watermarked_url text,
  credits_consumed integer not null default 0,
  is_public boolean not null default false,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Credit transactions
create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null,
  type text not null,
  description text,
  stripe_payment_id text,
  video_id uuid references public.videos(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Subscriptions
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_subscription_id text unique,
  plan text not null,
  billing_period text,
  status text not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  credits_per_period integer,
  created_at timestamptz not null default now()
);

-- Device channel bindings
create table public.device_channels (
  device_key text primary key,
  utm_source text,
  utm_campaign text,
  ref_param text,
  content_policy text not null default 'strict',
  country_code text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

-- Indexes
create index idx_videos_user_id on public.videos(user_id);
create index idx_videos_status on public.videos(status);
create index idx_videos_kling_task_id on public.videos(kling_task_id);
create index idx_videos_is_public on public.videos(is_public) where is_public = true;
create index idx_credit_transactions_user_id on public.credit_transactions(user_id);
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_stripe_id on public.subscriptions(stripe_subscription_id);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.videos enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.subscriptions enable row level security;
alter table public.device_channels enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Videos: users can CRUD their own videos, read public videos
create policy "Users can view own videos" on public.videos
  for select using (auth.uid() = user_id);
create policy "Users can view public videos" on public.videos
  for select using (is_public = true);
create policy "Users can create videos" on public.videos
  for insert with check (auth.uid() = user_id);
create policy "Users can update own videos" on public.videos
  for update using (auth.uid() = user_id);

-- Credit transactions: users can view their own
create policy "Users can view own transactions" on public.credit_transactions
  for select using (auth.uid() = user_id);

-- Subscriptions: users can view their own
create policy "Users can view own subscriptions" on public.subscriptions
  for select using (auth.uid() = user_id);

-- Device channels: public insert (for tracking), service role for read/update
create policy "Anyone can insert device channel" on public.device_channels
  for insert with check (true);
create policy "Service role can manage device channels" on public.device_channels
  for all using (auth.role() = 'service_role');

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, credits_balance)
  values (new.id, new.email, 9000);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

-- Create storage bucket for uploads
insert into storage.buckets (id, name, public) values ('uploads', 'uploads', true);

-- Storage policies
create policy "Anyone can upload images" on storage.objects
  for insert with check (bucket_id = 'uploads');
create policy "Anyone can view uploads" on storage.objects
  for select using (bucket_id = 'uploads');
