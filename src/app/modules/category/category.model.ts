import { Schema, model } from "mongoose";
import { CategoryStatus, ICategory } from "./category.interface";

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: Object.values(CategoryStatus),
      default: CategoryStatus.APPROVED,
    },
  },
  { timestamps: true }
);

export const Category = model<ICategory>("Category", categorySchema);