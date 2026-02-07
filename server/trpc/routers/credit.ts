import { router, protectedProcedure } from "../trpc";

export const creditRouter = router({
  // Get current credit balance
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const { data } = await ctx.supabase
      .from("profiles")
      .select("credits_balance, subscription_plan")
      .eq("id", ctx.user.id)
      .single();

    return {
      balance: data?.credits_balance ?? 0,
      plan: data?.subscription_plan ?? "free",
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
