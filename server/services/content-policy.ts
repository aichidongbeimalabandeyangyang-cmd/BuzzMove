import { STRICT_COUNTRIES } from "@/lib/constants";
import { createSupabaseAdminClient } from "@/server/supabase/server";

export type ContentPolicy = "strict" | "relaxed";

interface ContentPolicyInput {
  userId?: string;
  deviceKey?: string;
  countryCode?: string | null;
}

/**
 * Determine content policy for a user/device.
 * Priority: Geo override > Device channel binding > User profile > Default strict
 */
export async function resolveContentPolicy(
  input: ContentPolicyInput
): Promise<ContentPolicy> {
  // 1. Geo override: high-risk countries always strict
  if (
    input.countryCode &&
    STRICT_COUNTRIES.includes(input.countryCode as any)
  ) {
    return "strict";
  }

  const supabase = createSupabaseAdminClient();

  // 2. Check device channel binding (most reliable — set on first visit)
  if (input.deviceKey) {
    const { data: channel } = await supabase
      .from("device_channels")
      .select("content_policy")
      .eq("device_key", input.deviceKey)
      .single();

    if (channel?.content_policy) {
      return channel.content_policy as ContentPolicy;
    }
  }

  // 3. Check user profile
  if (input.userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("content_policy")
      .eq("id", input.userId)
      .single();

    if (profile?.content_policy) {
      return profile.content_policy as ContentPolicy;
    }
  }

  // 4. Default: strict
  return "strict";
}
