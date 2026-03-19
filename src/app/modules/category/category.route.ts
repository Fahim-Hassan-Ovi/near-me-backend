import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { CategoryControllers } from "./category.controller";

const router = Router();

router.post("/create",  CategoryControllers.createCategory);

// router.post("/create", checkAuth(Role.SUPER_ADMIN), CategoryControllers.createCategory);

router.get("/tree", CategoryControllers.getCategoryTree);

router.patch("/approve/:id", checkAuth(Role.SUPER_ADMIN), CategoryControllers.approveCategory);

export const CategoryRoutes = router;