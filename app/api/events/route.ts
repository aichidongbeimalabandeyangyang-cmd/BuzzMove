import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/server/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { event, email, metadata } = await request.json();

    if (!event || typeof event !== "string") {
      return NextResponse.json({ error: "Missing event" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    await supabase.from("system_events").insert({
      event,
      email: email ?? null,
      metadata: metadata ?? {},
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
