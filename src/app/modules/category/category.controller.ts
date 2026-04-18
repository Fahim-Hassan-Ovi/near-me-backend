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

/**
 * GET /categories/search?searchTerm=plumb&level=0
 *
 * Searches categories by name. Optionally filter by level:
 *   level=0  → root categories only   (page-1 search)
 *   level=1  → sub-categories only
 *   level=2  → child categories only
 * Omit level to search across all levels (page-2 search)
 */
const searchCategories = catchAsync(async (req, res) => {
  const { searchTerm, level } = req.query;

  const result = await CategoryServices.searchCategories(
    searchTerm as string | undefined,
    level !== undefined ? parseInt(level as string) : undefined
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Categories retrieved successfully",
    data: result,
  });
});

/**
 * GET /categories/:id/sub-tree
 *
 * Returns the full sub-tree (children + grandchildren) of a given category.
 * Used to populate the left panel on page-2 (sub-categories + child categories).
 */
const getCategorySubTree = catchAsync(async (req, res) => {
  const result = await CategoryServices.getCategorySubTree(
    req.params.id as string
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Category sub-tree retrieved successfully",
    data: result,
  });
});

export const CategoryControllers = {
  createCategory,
  getCategoryTree,
  approveCategory,
  searchCategories,
  getCategorySubTree
};