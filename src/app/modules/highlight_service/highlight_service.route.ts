import { Router } from "express";
import { HighlightServiceControllers } from "./highlight_service.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createHighlightServiceZodSchema, updateHighlightServiceZodSchema } from "./highlight_service.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.post(
    "/",
    validateRequest(createHighlightServiceZodSchema),
    checkAuth(Role.PROVIDER),
    HighlightServiceControllers.createHighlight
);

router.get(
  "/service/:serviceId",
  HighlightServiceControllers.getHighlightsByService
);

router.get(
  "/:id",
  HighlightServiceControllers.getSingleHighlight
);

router.patch(
    "/:id",
    validateRequest(updateHighlightServiceZodSchema),
    checkAuth(Role.PROVIDER),
    HighlightServiceControllers.updateHighlight
);

router.delete(
    "/:id",
    checkAuth(Role.PROVIDER),
    HighlightServiceControllers.deleteHighlight
);

export const HighlightServiceRoutes = router;