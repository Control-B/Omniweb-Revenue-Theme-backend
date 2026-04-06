import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import chatRouter from "./chat.js";
import voiceRouter from "./voice.js";
import widgetConfigRouter from "./widget-config.js";
import authRouter from "./auth.js";
import billingRouter from "./billing.js";
import analyticsRouter from "./analytics.js";
import shopifyOAuthRouter from "./shopify-oauth.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(shopifyOAuthRouter);
router.use(billingRouter);
router.use(chatRouter);
router.use(voiceRouter);
router.use(widgetConfigRouter);
router.use(analyticsRouter);

export default router;
