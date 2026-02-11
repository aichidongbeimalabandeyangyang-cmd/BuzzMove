import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import {
  createSupabaseServerClient,
  createSupabaseAdminClient,
} from "@/server/supabase/server";
import { ADMIN_EMAILS } from "@/lib/constants";

export const createTRPCContext = async (req?: Request) => {
  const supabase = await createSupabaseServerClient();
  const adminSupabase = createSupabaseAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Extract request metadata for server-side CAPI tracking
  const headers = req?.headers;
  const userAgent = headers?.get("user-agent") || undefined;
  const ip =
    headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers?.get("x-real-ip") ||
    undefined;

  return { supabase, adminSupabase, user, userAgent, ip };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (!ADMIN_EMAILS.includes(ctx.user.email ?? "")) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});
