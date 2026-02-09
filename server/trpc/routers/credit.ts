import { router, protectedProcedure } from "../trpc";

export const creditRouter = router({
  // Get current credit balance
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const { data } = await ctx.supabase
      .from("profiles")
      .select("credits_balance, subscription_plan")
      .eq("id", ctx.user.id)
      .single();

    const plan = data?.subscription_plan ?? "free";

    // Check if user has ever made a purchase (credit pack or subscription)
    let hasPurchased = plan !== "free";
    if (!hasPurchased) {
      const { count } = await ctx.supabase
        .from("credit_transactions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", ctx.user.id)
        .in("type", ["purchase", "subscription"])
        .limit(1);
      hasPurchased = (count ?? 0) > 0;
    }

    return {
      balance: data?.credits_balance ?? 0,
      plan,
      hasPurchased,
    };
  }),

  // Get credit transaction history
  getHistory: protectedProcedure.query(async ({ ctx }) => {
    const { data } = await ctx.supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", ctx.user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    return data || [];
  }),
});
