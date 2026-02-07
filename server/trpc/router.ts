import { router } from "./trpc";
import { userRouter } from "./routers/user";
import { videoRouter } from "./routers/video";
import { paymentRouter } from "./routers/payment";
import { creditRouter } from "./routers/credit";
import { trackingRouter } from "./routers/tracking";

export const appRouter = router({
  user: userRouter,
  video: videoRouter,
  payment: paymentRouter,
  credit: creditRouter,
  tracking: trackingRouter,
});

export type AppRouter = typeof appRouter;
