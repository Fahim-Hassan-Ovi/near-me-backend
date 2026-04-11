import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createServiceZodSchema,
  updateServiceZodSchema,
} from "./service.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { ServiceControllers } from "./service.controller";
import { multerUpload } from "../../config/multer.config";

const router = Router();

router.post(
  "/create",
  checkAuth(Role.PROVIDER),
  multerUpload.fields([
    { name: "media" },
    { name: "company_logo", maxCount: 1 },
  ]),
  validateRequest(createServiceZodSchema),
  ServiceControllers.createService
);

router.get(
  "/all-services",
  checkAuth(Role.SUPER_ADMIN),
  ServiceControllers.getAllServices
);

router.get("/:id", ServiceControllers.getSingleService);

// Route to get nearest services
router.post("/nearest", ServiceControllers.getNearestServices);

router.patch(
  "/:id",
  checkAuth(Role.PROVIDER),
  multerUpload.fields([
    { name: "media"},
    { name: "company_logo", maxCount: 1 },
  ]),
  validateRequest(updateServiceZodSchema),
  ServiceControllers.updateService
);

router.delete("/:id", checkAuth(Role.PROVIDER), ServiceControllers.deleteService);

export const ServiceRoutes = router;