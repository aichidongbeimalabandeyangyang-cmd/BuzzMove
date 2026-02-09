-- Image uploads table (independent of videos)
CREATE TABLE IF NOT EXISTS public.image_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  url text NOT NULL,
  filename text,
  size_bytes integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for listing user's images
CREATE INDEX IF NOT EXISTS idx_image_uploads_user_created
  ON public.image_uploads (user_id, created_at DESC);

-- Prevent duplicate URLs per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_image_uploads_user_url
  ON public.image_uploads (user_id, url);

-- RLS
ALTER TABLE public.image_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own images"
  ON public.image_uploads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images"
  ON public.image_uploads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own images"
  ON public.image_uploads FOR DELETE
  USING (auth.uid() = user_id);
