/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { success } from "zod";
import { sendResponse } from "../../utils/sendResponse";

// const createUserFunction = async (req: Request, res: Response) => {
//     const user = await UserServices.createUser(req.body);

//     res.status(httpStatus.CREATED).json({
//         message: "User Created Successfully",
//         user
//     })
// }


// const createUser = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         // throw new Error("Fake Error")
//         // throw new AppError(httpStatus.BAD_REQUEST, "fake error")

//         // createUserFunction(req, res);

//     } catch (err: any) {
//         console.log(err);
//         next(err);
//     }
// }

const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User created successfully",
        data: user
    })
})

// const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
//     try {

//         const users = await UserServices.getAllUsers();

//         res.status(httpStatus.OK).json({
//             success: true,
//             message: "All users retrieved successfully",
//             data: users
//         })
//     } catch (err: any) {
//         console.log(err);
//         next(err);
//     }
// }

const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.getAllUsers();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "All users retrieved successfully",
        data: result.data,
        meta: result.meta
    })
})
export const UserControllers = {
    createUser,
    getAllUsers
}