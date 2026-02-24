/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status-codes';
import { IsActive, IUser } from "../user/user.interface"
import AppError from '../../errorHelpers/AppError';
import { User } from '../user/user.model';
import bcryptjs from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { generateToken, verifyToken } from '../../utils/jwt';
import { envVars } from '../../config/env';
import { createNewAccessTokenWithRefreshToken, createUserTokens } from '../../utils/userToken';

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

    // const jwtPayload = {
    //     userId: isUserExist._id,
    //     email: isUserExist.email,
    //     role: isUserExist.role
    // }

    // // const accessToken = jwt.sign(jwtPayload,"secret", { expiresIn: "1d"} )

    // const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES);

    // const refreshToken = generateToken(jwtPayload, envVars.JWT_REFRESH_SECRET, envVars.JWT_REFRESH_EXPIRES);

    const userTokens = createUserTokens(isUserExist);

    // delete isUserExist.password;

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
        accessToken : newAccessToken
    }
}
const resetPassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {

    const user = await User.findById(decodedToken.userId);

    const isOldPasswordMatch = await bcryptjs.compare(oldPassword, user!.password as string);
    if(!isOldPasswordMatch){
        throw new AppError(httpStatus.UNAUTHORIZED, "Old password does not matched")
    }

    user!.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND));

    user!.save();

}

export const AuthServices = {
    credentialsLogin,
    getNewAccessToken,
    resetPassword
}