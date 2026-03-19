import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { CategoryServices } from "./category.service";
import httpStatus from "http-status-codes";

const createCategory = catchAsync(async (req, res) => {
  const result = await CategoryServices.createCategory(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Category created successfully",
    data: result,
  });
});

const getCategoryTree = catchAsync(async (req, res) => {
  const result = await CategoryServices.getCategoryTree();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Category tree retrieved",
    data: result,
  });
});

const approveCategory = catchAsync(async (req, res) => {
  const result = await CategoryServices.approveCategory(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Category approved",
    data: result,
  });
});

export const CategoryControllers = {
  createCategory,
  getCategoryTree,
  approveCategory,
};