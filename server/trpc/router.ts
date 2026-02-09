import { router } from "./trpc";
import { userRouter } from "./routers/user";
import { videoRouter } from "./routers/video";
import { imageRouter } from "./routers/image";
import { paymentRouter } from "./routers/payment";
import { creditRouter } from "./routers/credit";
import { trackingRouter } from "./routers/tracking";
import { referralRouter } from "./routers/referral";

export const appRouter = router({
  user: userRouter,
  video: videoRouter,
  image: imageRouter,
  payment: paymentRouter,
  credit: creditRouter,
  tracking: trackingRouter,
  referral: referralRouter,
});

export type AppRouter = typeof appRouter;
