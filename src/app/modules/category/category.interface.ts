import { Types } from "mongoose";

export enum CategoryStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface ICategory {
  _id?: Types.ObjectId;
  name: string;
  createdBy?: Types.ObjectId;
  status: CategoryStatus;
}