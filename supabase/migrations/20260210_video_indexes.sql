-- Composite index for cron queries (recover-stuck-videos) and admin dashboard
-- Covers: WHERE status IN (...) AND created_at < ...
create index if not exists idx_videos_status_created_at
  on public.videos (status, created_at);

-- Index for user video listings ordered by created_at
create index if not exists idx_videos_user_created_at
  on public.videos (user_id, created_at desc);
