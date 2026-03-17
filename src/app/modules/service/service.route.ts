import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { createServiceZodSchema, updateServiceZodSchema } from "./service.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { ServiceControllers } from "./service.controller";

const router = Router();

router.post("/create",
    validateRequest(createServiceZodSchema),
    checkAuth(Role.PROVIDER),
    ServiceControllers.createService);


router.get("/all-services",
    checkAuth(Role.SUPER_ADMIN),
    ServiceControllers.getAllServices);

router.get("/:id",
    ServiceControllers.getSingleService);

router.patch("/:id",
    validateRequest(updateServiceZodSchema),
    checkAuth(Role.PROVIDER),
    ServiceControllers.updateService);

router.delete("/:id",
    checkAuth(Role.PROVIDER),
    ServiceControllers.deleteService);

export const ServiceRoutes = router;