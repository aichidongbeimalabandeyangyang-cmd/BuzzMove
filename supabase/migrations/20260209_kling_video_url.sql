-- Store original Kling video URL separately for fallback
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS kling_video_url text;
