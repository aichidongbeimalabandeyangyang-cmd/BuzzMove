import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/server/supabase/server";
import { SUPPORTED_FORMATS, MAX_FILE_SIZE } from "@/lib/constants";
import { logServerEvent } from "@/server/services/events";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!SUPPORTED_FORMATS.includes(file.type)) {
    return NextResponse.json(
      { error: "Unsupported format. Use JPEG, PNG, or WebP." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum 10MB." },
      { status: 400 }
    );
  }

  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { data, error } = await supabase.storage
    .from("uploads")
    .upload(`images/${fileName}`, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    logServerEvent("upload_fail", { userId: user.id, metadata: { error: error.message, filename: file.name } });
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("uploads").getPublicUrl(data.path);

  // Record in image_uploads table (ignore duplicate — UNIQUE index handles it)
  const { error: insertError } = await supabase.from("image_uploads").insert({
    user_id: user.id,
    url: publicUrl,
    filename: file.name,
    size_bytes: file.size,
  });

  if (insertError) {
    logServerEvent("upload_db_insert_fail", { userId: user.id, metadata: { error: insertError.message, url: publicUrl } });
  }

  return NextResponse.json({ url: publicUrl });
}
