import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/server/supabase/server";

const MAX_PAYLOAD_SIZE = 4096; // bytes

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    if (body.length > MAX_PAYLOAD_SIZE) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const { event, email, metadata } = JSON.parse(body);

    if (!event || typeof event !== "string" || event.length > 100) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    await supabase.from("system_events").insert({
      event,
      email: typeof email === "string" ? email.slice(0, 255) : null,
      metadata: metadata ?? {},
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
