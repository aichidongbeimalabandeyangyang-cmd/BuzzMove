import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseAdminClient,
} from "@/server/supabase/server";
import { validateDeviceKey } from "@/server/services/device-fingerprint";
import { isDisposableEmail } from "@/server/services/email-validation";

export async function POST(request: NextRequest) {
  let body: { device_key?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const deviceKey = body.device_key;
  if (!deviceKey || typeof deviceKey !== "string" || !validateDeviceKey(deviceKey)) {
    return NextResponse.json({ error: "Invalid device_key" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Defense-in-depth: block disposable emails even if client-side check was bypassed
  if (user.email && isDisposableEmail(user.email)) {
    console.warn(`[claim-signup-credits] Disposable email blocked: ${user.email}`);
    return NextResponse.json({ balance: 0 });
  }

  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;

  const admin = createSupabaseAdminClient();

  const { data: balance, error } = await admin.rpc("claim_signup_credits", {
    p_user_id: user.id,
    p_device_key: deviceKey,
    p_ip_address: ipAddress,
  });

  if (error) {
    console.error("[claim-signup-credits] RPC error:", error.message);
    return NextResponse.json({ error: "Failed to claim credits" }, { status: 500 });
  }

  // Store device_key on profile for future tracking
  await admin
    .from("profiles")
    .update({ device_key: deviceKey })
    .eq("id", user.id);

  return NextResponse.json({ balance: balance ?? 0 });
}
