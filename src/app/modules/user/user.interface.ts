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

export interface ICoord {
  lat: number;
  long: number;
}

export interface IUser {
    _id?: Types.ObjectId;
    name: string;
    email: string;
    password ?: string;
    picture ?: string;
    isDeleted ?: string;
    isActive ?: IsActive;
    isVerified ?: boolean;
    role: Role;
    auths: IAuthProvider[];
    service ?: Types.ObjectId[]; 
    reviews ?: Types.ObjectId[];
    chats ?: Types.ObjectId[];
    createdAt?: Date;
    fcmToken?: string;
    coord?: ICoord;
}