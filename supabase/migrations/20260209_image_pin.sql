-- Add pinned column to image_uploads
ALTER TABLE public.image_uploads
  ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false;

-- Index for sorting pinned first
CREATE INDEX IF NOT EXISTS idx_image_uploads_pinned
  ON public.image_uploads (user_id, is_pinned DESC, created_at DESC);

-- Allow users to update their own images (for pin/unpin)
CREATE POLICY "Users can update own images"
  ON public.image_uploads FOR UPDATE
  USING (auth.uid() = user_id);
