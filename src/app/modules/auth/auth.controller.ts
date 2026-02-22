/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import httpStatus from 'http-status-codes';
import { sendResponse } from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // const user = await UserServices.createUser(req.body);

    const loginInfo = await AuthServices.credentialsLogin(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logged in successfully",
        data: loginInfo
    })
})

export const AuthControllers = {
    credentialsLogin
}