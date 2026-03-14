/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { success } from "zod";
import { sendResponse } from "../../utils/sendResponse";
import { verifyToken } from "../../utils/jwt";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";


const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body);
    // console.log(req.body)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User created successfully",
        data: user
    })
})

const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id as string;
    

    const verifiedToken = req.user;

    const payload = req.body;
    const user = await UserServices.updateUser(userId, payload, verifiedToken as JwtPayload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User updated successfully",
        data: user
    })
})


// from me
// const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     const result = await UserServices.getAllUsers();

//     sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.CREATED,
//         message: "All users retrieved successfully",
//         data: result.data,
//         meta: result.meta
//     })
// })

// from ph
const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await UserServices.getAllUsers(query as Record<string, string>);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "All Users Retrieved Successfully",
        data: result.data,
        meta: result.meta
    })
})

const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload
    const result = await UserServices.getMe(decodedToken.userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Your profile Retrieved Successfully",
        data: result.data
    })
})

const getSingleUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await UserServices.getSingleUser(id as string);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Retrieved Successfully",
        data: result.data
    })
})
export const UserControllers = {
    createUser,
    getAllUsers,
    updateUser,
    getSingleUser,
    getMe
}