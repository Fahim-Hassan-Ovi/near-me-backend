/* eslint-disable @typescript-eslint/no-explicit-any */
import { Category } from "./category.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";

const createCategory = async (payload: any) => {
  const { name, parent, isCustom } = payload;

  let level: 0 | 1 | 2 = 0;

  if(!name){
    throw new AppError(httpStatus.NOT_FOUND, "No name is given")
  }

  if (parent) {
    const parentCategory = await Category.findById(parent);

    if (!parentCategory) {
      throw new AppError(httpStatus.NOT_FOUND, "Parent not found");
    }

    level = (parentCategory.level + 1) as 0 | 1 | 2;

    if (level > 2) {
      throw new AppError(httpStatus.BAD_REQUEST, "Max 3 level allowed");
    }
  }

  const category = await Category.create({
    name,
    parent: parent || null,
    level,
    isCustom: isCustom || false,
    isApproved: !isCustom, // custom = pending
  });

  return category;
};

const getCategoryTree = async () => {
  const categories = await Category.find({ isApproved: true }).lean();

  const map = new Map();

  categories.forEach((cat: any) => {
    map.set(cat._id.toString(), { ...cat, children: [] });
  });

  const tree: any[] = [];

  categories.forEach((cat: any) => {
    if (cat.parent) {
      map.get(cat.parent.toString())?.children.push(
        map.get(cat._id.toString())
      );
    } else {
      tree.push(map.get(cat._id.toString()));
    }
  });

  return tree;
};

const approveCategory = async (id: string) => {
  const category = await Category.findByIdAndUpdate(
    id,
    { isApproved: true },
    { new: true }
  );

  return category;
};

export const CategoryServices = {
  createCategory,
  getCategoryTree,
  approveCategory,
};