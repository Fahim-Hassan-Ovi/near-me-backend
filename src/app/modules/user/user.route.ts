/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response, Router } from "express";
import { UserControllers } from "./user.controller";
import z, { ZodObject, ZodSchema } from "zod";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import jwt, { JwtPayload } from 'jsonwebtoken';
import AppError from "../../errorHelpers/AppError";
import { Role } from "./user.interface";
import { verifyToken } from "../../utils/jwt";
import { envVars } from "../../config/env";
import { checkAuth } from "../../middlewares/checkAuth";



const router = Router();


router.post("/register", 
    validateRequest(createUserZodSchema), 
    UserControllers.createUser);

router.get("/all-users", checkAuth(Role.PROVIDER, Role.SUPER_ADMIN) , UserControllers.getAllUsers);
router.get("/me", checkAuth(...Object.values(Role)) , UserControllers.getMe);
router.get("/:id", checkAuth(Role.PROVIDER, Role.SUPER_ADMIN), UserControllers.getSingleUser)
router.patch("/:id", validateRequest(updateUserZodSchema), checkAuth(...Object.values(Role)), UserControllers.updateUser)
// /api/v1/user/:id
export const UserRoutes = router;
