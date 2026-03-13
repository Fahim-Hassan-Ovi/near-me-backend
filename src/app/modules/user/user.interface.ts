import { Types } from "mongoose";

export enum Role {
    USER = "USER",
    PROVIDER = "PROVIDER",
    SUPER_ADMIN = "SUPER_ADMIN"
}

export enum IsActive {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    BLOCKED = " BLOCKED"
}

export interface IAuthProvider {
    provider: "google" | "credentials" | "apple";
    providerId: string;
}

export interface IUser {
    _id?: Types.ObjectId;
    name: string;
    age?: number;
    email: string;
    password ?: string;
    phone ?: string;
    picture ?: string;
    address ?: string;
    isDeleted ?: string;
    isActive ?: IsActive;
    isVerified ?: boolean;
    role: Role;
    auths: IAuthProvider[];
    bookings ?: Types.ObjectId[]; 
    guides ?: Types.ObjectId[];
    createdAt?: Date;
}