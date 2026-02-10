import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createSupabaseAdminClient } from "@/server/supabase/server";
import { REFERRAL_REWARD_CREDITS } from "@/lib/constants";
import { isDisposableEmail } from "@/server/services/email-validation";
import { validateDeviceKey } from "@/server/services/device-fingerprint";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirectTo");

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  const baseUrl = isLocalEnv
    ? origin
    : forwardedHost
      ? `https://${forwardedHost}`
      : origin;

  if (code) {
    const destination = redirectTo && redirectTo.startsWith("/") ? redirectTo : "/";
    const response = NextResponse.redirect(`${baseUrl}${destination}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if profile exists, create if not
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        const isNewUser = !profile;

        if (isNewUser) {
          // Trigger gives 0 credits; fallback insert also uses 0
          await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
            credits_balance: 0,
          });
        }

        // Claim free signup credits for new users (device fingerprint check)
        if (isNewUser) {
          const isDisposable = user.email ? isDisposableEmail(user.email) : false;
          const deviceKey = request.cookies.get("vv_device_key")?.value;
          const ipAddress =
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            request.headers.get("x-real-ip") ||
            null;

          if (!isDisposable && deviceKey && validateDeviceKey(deviceKey)) {
            const admin = createSupabaseAdminClient();
            await admin.rpc("claim_signup_credits", {
              p_user_id: user.id,
              p_device_key: deviceKey,
              p_ip_address: ipAddress,
            });
            await admin
              .from("profiles")
              .update({ device_key: deviceKey })
              .eq("id", user.id);
          } else if (isDisposable) {
            console.warn(`[auth/callback] Disposable email blocked credits: ${user.email}`);
          }

          // Clear the device_key cookie
          response.cookies.set("vv_device_key", "", { path: "/", maxAge: 0 });
        }

        // Link referral from cookie (set by UtmTracker before OAuth redirect)
        const refCode = request.cookies.get("buzzmove_ref")?.value;
        if (refCode && user) {
          try {
            const admin = createSupabaseAdminClient();
            const { data: referrer } = await admin
              .from("profiles")
              .select("id")
              .eq("referral_code", refCode)
              .single();

            if (referrer && referrer.id !== user.id) {
              await admin.from("referrals").insert({
                referrer_id: referrer.id,
                referee_id: user.id,
                status: "pending",
                reward_credits: REFERRAL_REWARD_CREDITS,
              });
            }
          } catch {
            // Ignore errors (duplicate, missing table, etc.)
          }
          // Clear the ref cookie
          response.cookies.set("buzzmove_ref", "", { path: "/", maxAge: 0 });
        }
      }

      return response;
    }
  }

  return NextResponse.redirect(`${baseUrl}/?error=auth`);
}
