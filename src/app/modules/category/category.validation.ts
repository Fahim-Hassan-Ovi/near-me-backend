import z from "zod";
import { CategoryStatus } from "./category.interface";

export const createCategoryZodSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Category name must be at least 2 characters" })
    .max(50),

  status: z
    .enum(Object.values(CategoryStatus) as [string])
    .optional(),
});