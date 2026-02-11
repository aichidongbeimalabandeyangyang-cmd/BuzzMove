-- Track when a video was first downloaded
alter table public.videos add column downloaded_at timestamptz;
