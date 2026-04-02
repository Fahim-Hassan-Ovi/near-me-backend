import express from "express";
import { SubscriptionController } from "./subscription.controller";
import { checkAuth } from "../../middlewares/checkAuth";

const router = express.Router();

router.get("/my-plan", checkAuth(), SubscriptionController.getMyCurrentSubscription);
router.get("/history", checkAuth(), SubscriptionController.getMySubscriptionHistory);
router.post("/subscribe", checkAuth(), SubscriptionController.subscribeToPlan);
router.post("/cancel", checkAuth(), SubscriptionController.cancelMySubscription);

export const SubscriptionRoutes = router;