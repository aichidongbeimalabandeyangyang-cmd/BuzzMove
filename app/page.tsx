"use client";

import { useState } from "react";
import { UploadZone } from "@/components/upload/upload-zone";
import { VideoGenerator } from "@/components/video/video-generator";
import { createSupabaseBrowserClient } from "@/server/supabase/client";

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelected = async (file: File) => {
    // Create preview
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setSelectedFile(file);

    // Upload to Supabase Storage
    setUploading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("uploads")
        .upload(`images/${fileName}`, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("uploads").getPublicUrl(data.path);

      setImageUrl(publicUrl);
    } catch (err) {
      console.error("Upload failed:", err);
      setSelectedFile(null);
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImageUrl(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 py-12">
      {imageUrl && imagePreview ? (
        <VideoGenerator
          imageUrl={imageUrl}
          imagePreview={imagePreview}
          onReset={handleReset}
        />
      ) : (
        <div className="w-full max-w-md">
          {uploading ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
              <p className="text-sm text-[var(--muted-foreground)]">
                Uploading image...
              </p>
            </div>
          ) : (
            <UploadZone onFileSelected={handleFileSelected} />
          )}
        </div>
      )}
    </div>
  );
}
