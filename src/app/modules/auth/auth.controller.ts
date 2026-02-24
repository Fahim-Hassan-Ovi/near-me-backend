/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import httpStatus from 'http-status-codes';
import { sendResponse } from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";
import AppError from "../../errorHelpers/AppError";

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // const user = await UserServices.createUser(req.body);

    const loginInfo = await AuthServices.credentialsLogin(req.body);

    res.cookie("accessToken", loginInfo.accessToken, {
        httpOnly: true,
        secure: false
    })

    res.cookie("refreshToken", loginInfo.refreshToken, {
        httpOnly: true,
        secure: false
    })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logged in successfully",
        data: loginInfo
    })
})

const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken){
        throw new AppError(httpStatus.BAD_REQUEST, "No refresh token received from cookies");
    }
    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logged in successfully",
        data: tokenInfo
    })
})

export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken
}