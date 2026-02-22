/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status-codes';
import { IUser } from "../user/user.interface"
import AppError from '../../errorHelpers/AppError';
import { User } from '../user/user.model';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

    const jwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role
    }

    const accessToken = jwt.sign(jwtPayload,"secret", { expiresIn: "1d"} )

    return {
        accessToken
    }
}

export const AuthServices = {
    credentialsLogin
}