/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { getEffectivePlan } from "./getEffectivePlan";


export const enforceCategoryLimit = async (
  userId: string,
  currentCategoryCount: number,
  newCategoryCount = 1
) => {
  const plan: any = await getEffectivePlan(userId);
  const limit = plan.features.maxServiceCategories;

  if (limit !== -1 && currentCategoryCount + newCategoryCount > limit) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `Your current plan allows maximum ${limit} categories/services`
    );
  }
};
