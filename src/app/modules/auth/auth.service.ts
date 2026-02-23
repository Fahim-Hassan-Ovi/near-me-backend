/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status-codes';
import { IsActive, IUser } from "../user/user.interface"
import AppError from '../../errorHelpers/AppError';
import { User } from '../user/user.model';
import bcryptjs from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { generateToken, verifyToken } from '../../utils/jwt';
import { envVars } from '../../config/env';
import { createUserTokens } from '../../utils/userToken';

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

    const {password : pass, ...rest} = isUserExist.toObject();

    return {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        user: rest
    }
}
const getNewAccessToken = async (refreshToken: string) => {

    const verifiedRefreshToken = verifyToken(refreshToken, envVars.JWT_REFRESH_SECRET) as JwtPayload;

    const isUserExist = await User.findOne({ email: verifiedRefreshToken.email });

    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
    }

    if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
        throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`);
    }

    if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
    }

    const IsPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string)

    if (!IsPasswordMatched) {
        throw new AppError(httpStatus.BAD_REQUEST, "Password does not matched");
    }

    
    const userTokens = createUserTokens(isUserExist);


    const {password : pass, ...rest} = isUserExist.toObject();

    return {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        user: rest
    }
}

export const AuthServices = {
    credentialsLogin,
    getNewAccessToken
}