/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import httpStatus from 'http-status-codes';
import { sendResponse } from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";
import AppError from "../../errorHelpers/AppError";
import { setAuthCookie } from "../../utils/setCookie";
import { JwtPayload } from "jsonwebtoken";
import { createUserTokens } from "../../utils/userToken";
import { envVars } from "../../config/env";
import passport from "passport";

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", async (err: any, user: any, info: any) => {
        console.log(err)
        if (err) {
            console.log("from err", err)
            return next(new AppError(err.statusCode || 401, err.message));
        }

        if (!user) {
            console.log("from !user", err)
            return next(new AppError(401, info.message));
        }

        const userToken = await createUserTokens(user);

        const { password: pass, ...rest } = user.toObject();

        setAuthCookie(res, userToken)

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "User logged in successfully",
            data: {
                accessToken: userToken.accessToken,
                refreshToken: userToken.refreshToken,
                user: rest
            }
        })
    })(req, res, next)
})

const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new AppError(httpStatus.BAD_REQUEST, "No refresh token received from cookies");
    }
    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken as string);

    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "New Access Token Retrieved successfully",
        data: tokenInfo
    })
})

const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logged out successfully",
        data: null
    })
})

// CHANGE PASSWORD
const changePassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = req.user as JwtPayload;
        const { oldPassword, newPassword } = req.body;
        await AuthServices.changePassword(userId, oldPassword, newPassword);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Password has been changed',
            data: null,
        });
    }
);

// FORGET PASSWORD
const forgetPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.params;
        const result = await AuthServices.forgetPassword(email as string);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Password reset OTP sent',
            data: result,
        });
    }
);

// VERIFY FORGET PASSWORD OTP
const verifyForgetPasswordOTP = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, otp } = req.body;
        const result = await AuthServices.verifyForgetPasswordOTP(
            email as string,
            otp
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'OTP verified',
            data: result,
        });
    }
);

// RESET PASSWORD
const resetPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.token as string;

        const { newPassword } = req.body;
        const result = await AuthServices.resetPassword(token, newPassword);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Password reset success',
            data: result,
        });
    }
);

// const changePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {


//     const newPassword = req.body.newPassword;
//     const oldPassword = req.body.oldPassword;
//     const decodedToken = req.user as JwtPayload;

//     await AuthServices.changePassword(oldPassword, newPassword, decodedToken);

//     sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.OK,
//         message: "Password change successfully",
//         data: null
//     })
// })

// const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

//     const decodedToken = req.user
//     // console.log(req.body);

//     await AuthServices.resetPassword(req.body, decodedToken as JwtPayload);

//     sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.OK,
//         message: "Password Changed Successfully",
//         data: null,
//     })
// })

// const setPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

//     const decodedToken = req.user as JwtPayload
//     const { password } = req.body;

//     await AuthServices.setPassword(decodedToken.userId, password);

//     sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.OK,
//         message: "Password Changed Successfully",
//         data: null,
//     })
// })

// const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {


//     const { email } = req.body;

//     await AuthServices.forgotPassword(email);

//     sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.OK,
//         message: "Email Sent Successfully",
//         data: null,
//     })
// })

const googleRegister = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const redirect = req.query.redirect || "/";

    passport.authenticate("google", {
        scope: ["profile", "email"],
        state: redirect as string,
        prompt: 'consent select_account'
    })(req, res, next)
})

const googleCallbackController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    let redirectTo = req.query.state ? req.query.state as string : "";

    if (redirectTo.startsWith("/")) {
        redirectTo = redirectTo.slice(1);
    }
    const user = req.user;
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }
    const tokenInfo = await createUserTokens(user);

    setAuthCookie(res, tokenInfo);
    res.redirect(`${envVars?.FRONTEND_URL}/${redirectTo}`)
})

export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logout,
    changePassword,
    resetPassword,
    verifyForgetPasswordOTP,
    forgetPassword,
    googleCallbackController,
    googleRegister
}