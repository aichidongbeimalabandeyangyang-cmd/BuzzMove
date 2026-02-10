import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/server/supabase/server";
import { VideoShareClient } from "./client";

const SITE_URL = "https://buzzmove.me";

async function getVideo(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("videos")
    .select("id, output_video_url, input_image_url, prompt, created_at, duration, mode")
    .eq("id", id)
    .eq("status", "completed")
    .single();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const video = await getVideo(id);
  if (!video) return { title: "Video Not Found | BuzzMove" };

  const description = video.prompt
    ? `"${video.prompt.slice(0, 120)}" — AI-generated video on BuzzMove`
    : "Check out this AI-generated video on BuzzMove";

  return {
    title: "AI Video — BuzzMove",
    description,
    openGraph: {
      title: "AI Video — BuzzMove",
      description,
      url: `${SITE_URL}/v/${video.id}`,
      siteName: "BuzzMove",
      type: "video.other",
      videos: video.output_video_url
        ? [{ url: video.output_video_url, type: "video/mp4" }]
        : undefined,
      images: video.input_image_url
        ? [{ url: video.input_image_url, width: 720, height: 960 }]
        : undefined,
    },
    twitter: {
      card: "player",
      title: "AI Video — BuzzMove",
      description,
    },
  };
}

export default async function VideoSharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = await getVideo(id);
  if (!video) notFound();

  return (
    <VideoShareClient
      videoUrl={video.output_video_url}
      imageUrl={video.input_image_url}
      prompt={video.prompt}
      duration={video.duration}
      mode={video.mode}
    />
  );
}
