
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from 'http-status-codes';
import bcryptjs from 'bcryptjs';
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { userSearchableFields } from "./user.constant";

const createUser = async (payload: Partial<IUser>) => {

    const { email, password, ...rest } = payload;
    // console.log(email, password);
    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User Already Exists")
    }

    if (!password) {
        throw new AppError(httpStatus.BAD_REQUEST, "Password is required");
    }


    const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND))

    const authProvider: IAuthProvider = { provider: "credentials", providerId: email as string };
    // console.log(email, password)

    const user = await User.create({
        email,
        password: hashedPassword,
        auths: [authProvider],
        ...rest
    })

    return user;
}

const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {

    if (decodedToken.role === Role.USER) {
        if (userId !== decodedToken.userId) {
            throw new AppError(401, "You are not authorized")
        }
    }

    const ifUserExist = await User.findById(userId);

    if (!ifUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }

    if (decodedToken.role === Role.PROVIDER && ifUserExist.role === Role.SUPER_ADMIN) {
        throw new AppError(401, "You are not authorized")
    }

    if (payload.role) {
        if (decodedToken.role === Role.USER) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
        }
        if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.PROVIDER) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
        }
    }

    if (payload.isActive || payload.isDeleted || payload.isVerified) {
        if (decodedToken.role === Role.USER) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized")
        }
    }

    const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true });

    return newUpdatedUser;
}

// // My code 
// const getAllUsers = async () => {
//     const users = await User.find({});

//     const totalUsers = await User.countDocuments();

//     return {
//         data: users,
//         meta: {
//             total: totalUsers
//         }
//     };
// }


// From PH code
const getAllUsers = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(User.find(), query)
    const usersData = queryBuilder
        .filter()
        .search(userSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        usersData.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
};

const getSingleUser = async (id: string) => {
    const user = await User.findById(id).select("-password");
    return {
        data: user
    }
};

const getMe = async (userId: string) => {
    const user = await User.findById(userId).select("-password");
    return {
        data: user
    }
};

export const UserServices = {
    createUser,
    getAllUsers,
    updateUser,
    getSingleUser,
    getMe
}