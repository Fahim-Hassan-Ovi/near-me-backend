/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus, { StatusCodes } from 'http-status-codes';
import { IAuthProvider, IsActive, IUser } from "../user/user.interface"
import AppError from '../../errorHelpers/AppError';
import { User } from '../user/user.model';
import bcryptjs from 'bcryptjs';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { generateToken, verifyToken } from '../../utils/jwt';
import { envVars } from '../../config/env';
import { createNewAccessTokenWithRefreshToken, createUserTokens } from '../../utils/userToken';
import { sendEmail } from '../../utils/sendEmail';
import { randomOTPGenerator } from '../../utils/randomOTPGenerator';
import { redisClient } from '../../config/redis.config';

const credentialsLogin = async (payload: Partial<IUser>) => {
    const { email, password } = payload;
    const isUserExist = await User.findOne({ email });

    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
    }

    const IsPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string)

    if (!IsPasswordMatched) {
        throw new AppError(httpStatus.BAD_REQUEST, "Password does not matched");
    }

    const userTokens = createUserTokens(isUserExist);


    const { password: pass, ...rest } = isUserExist.toObject();

    return {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        user: rest
    }
}
const getNewAccessToken = async (refreshToken: string) => {

    const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken);

    return {
        accessToken: newAccessToken
    }
}

// CHANGE PASSWORD
const changePassword = async (
    userId: string,
    oldPassword: string,
    newPassword: string
) => {
    const user = await User.findById(userId).select('+password');
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
    }

    if (!oldPassword) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'Please provide your old password!'
        );
    }

    if (!newPassword) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'Please provide your new password!'
        );
    }

    const matchPassword = await bcryptjs.compare(
        oldPassword,
        user.password as string
    );
    if (!matchPassword) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Password doesn't matched!");
    }

    //   console.log(newPassword);

    user.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND));
    await user.save();

    return null;
};

// FORGET PASSWORD
const forgetPassword = async (email: string) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
    }

    if (user.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User was deleted!');
    }

    if (
        user.isActive === IsActive.INACTIVE ||
        user.isActive === IsActive.BLOCKED
    ) {
        throw new AppError(httpStatus.BAD_REQUEST, `User is ${user.isActive}`);
    }

    const otp = randomOTPGenerator(100000, 999999).toString(); // Generate OTP
    const hashedOTP = await bcryptjs.hash(otp, Number(envVars.BCRYPT_SALT_ROUND)); // Hashed OTP

    // CACHED OTP TO REDIS
    await redisClient.set(`otp:${user.email}`, hashedOTP, { EX: 120 }); // 2 min

    // SENDING OTP TO EMAIL
    await sendEmail({
        to: user.email,
        subject: 'Near Me: Password Reset OTP',
        templateName: 'forgetPassword_otp_send',
        templateData: {
            name: user.name,
            expirationTime: 2,
            otp,
        },
    });

    return null;
};

// VERIFY RESET PASSWORD OTP
const verifyForgetPasswordOTP = async (email: string, otp: string) => {
    if (!email) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Email required!');
    }

    // CHECK USER
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No user found!');
    }

    if (!otp || otp.length < 6) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Wrong OTP!');
    }

    // OTP MATCHING PART
    const getOTP = await redisClient.get(`otp:${email}`);

    if (!getOTP) {
        throw new AppError(httpStatus.BAD_REQUEST, 'OTP has expired!');
    }

    // Matching otp
    const isOTPMatched = await bcryptjs.compare(otp, getOTP); // COMPARE WITH OTP
    if (!isOTPMatched) {
        throw new AppError(httpStatus.BAD_REQUEST, 'OTP is not matched!');
    }

    const jwtPayload = { email, verified: true };
    const jwtToken = jwt.sign(jwtPayload, envVars.OTP_JWT_ACCESS_SECRET, {
        expiresIn: envVars.OTP_JWT_ACCESS_EXPIRATION,
    } as SignOptions);

    // DELETED OTP AFTER USED
    await redisClient.del(`otp:${email}`);
    return jwtToken;
};

// RESET PASSWORD
const resetPassword = async (token: string, newPassword: string) => {
    if (!token) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Token must required!');
    }

    const verifyToken = jwt.verify(
        token,
        envVars.OTP_JWT_ACCESS_SECRET
    ) as JwtPayload;

    if (!verifyToken) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid token or expired!');
    }

    if (!verifyToken?.verified) {
        throw new AppError(httpStatus.BAD_REQUEST, "OTP wasn't verified yet");
    }

    // CHECK USER
    const user = await User.findOne({ email: verifyToken?.email });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No user found!');
    }

    // SET NEW PASSWORD
    const hashedPassword = await bcryptjs.hash(
        newPassword,
        Number(envVars.BCRYPT_SALT_ROUND)
    );

    user.password = hashedPassword;
    await user.save();

    return null;
};


// const changePassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {

//     const user = await User.findById(decodedToken.userId);

//     const isOldPasswordMatch = await bcryptjs.compare(oldPassword, user!.password as string);
//     if(!isOldPasswordMatch){
//         throw new AppError(httpStatus.UNAUTHORIZED, "Old password does not matched")
//     }

//     user!.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND));

//     user!.save();

// }
// const resetPassword = async (payload: Record<string, any>, decodedToken: JwtPayload) => {
//     if (payload.id != decodedToken.userId) {
//         throw new AppError(401, "You can not reset your password")
//     }

//     const isUserExist = await User.findById(decodedToken.userId)
//     if (!isUserExist) {
//         throw new AppError(401, "User does not exist")
//     }

//     const hashedPassword = await bcryptjs.hash(
//         payload.newPassword,
//         Number(envVars.BCRYPT_SALT_ROUND)
//     )

//     isUserExist.password = hashedPassword;

//     await isUserExist.save()
// }

// const forgotPassword = async (email: string) => {
//     const isUserExist = await User.findOne({ email });

//     if (!isUserExist) {
//         throw new AppError(httpStatus.BAD_REQUEST, "User does not exist")
//     }
//     if (!isUserExist.isVerified) {
//         throw new AppError(httpStatus.BAD_REQUEST, "User is not verified")
//     }
//     if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
//         throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`)
//     }
//     if (isUserExist.isDeleted) {
//         throw new AppError(httpStatus.BAD_REQUEST, "User is deleted")
//     }

//     const jwtPayload = {
//         userId: isUserExist._id,
//         email: isUserExist.email,
//         role: isUserExist.role
//     }

//     const resetToken = jwt.sign(jwtPayload, envVars.JWT_ACCESS_SECRET, {
//         expiresIn: "10m"
//     })

//     const resetUILink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`

//     sendEmail({
//         to: isUserExist.email,
//         subject: "Password Reset",
//         templateName: "forgetPassword",
//         templateData: {
//             name: isUserExist.name,
//             resetUILink
//         }
//     })

//     /**
//      * http://localhost:5173/reset-password?id=687f310c724151eb2fcf0c41&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODdmMzEwYzcyNDE1MWViMmZjZjBjNDEiLCJlbWFpbCI6InNhbWluaXNyYXI2QGdtYWlsLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzUzMTY2MTM3LCJleHAiOjE3NTMxNjY3Mzd9.LQgXBmyBpEPpAQyPjDNPL4m2xLF4XomfUPfoxeG0MKg
//      */
// }

// const setPassword = async (userId: string, plainPassword: string) => {
//     const user = await User.findById(userId);

//     if (!user) {
//         throw new AppError(404, "User not found");
//     }

//     if (user.password && user.auths.some(providerObject => providerObject.provider === "google")) {
//         throw new AppError(httpStatus.BAD_REQUEST, "You have already set your password. Now you can change the password from your profile password update")
//     }

//     const hashedPassword = await bcryptjs.hash(
//         plainPassword,
//         Number(envVars.BCRYPT_SALT_ROUND)
//     )

//     const credentialProvider: IAuthProvider = {
//         provider: "credentials",
//         providerId: user.email
//     }

//     const auths: IAuthProvider[] = [...user.auths, credentialProvider]

//     user.password = hashedPassword

//     user.auths = auths

//     await user.save()

// }

export const AuthServices = {
    credentialsLogin,
    getNewAccessToken,
    changePassword,
    resetPassword,
    forgetPassword,
    verifyForgetPasswordOTP,
}