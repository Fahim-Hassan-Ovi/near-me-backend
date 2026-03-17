/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { ServiceServices } from "./service.service";
import { JwtPayload } from "jsonwebtoken";

const createService = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{
    const service = await ServiceServices.createService(req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Service created successfully",
        data: service
    })
})

const getAllServices = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    const query = req.query;
    const result = await ServiceServices.getAllServices(query as Record<string, string>);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "All Services Retrieved Successfully",
        data: result.data,
        meta: result.meta
    })
})

const getSingleService = catchAsync(async ( req: Request, res: Response, next: NextFunction) =>{
    const id = req.params.id as string;
    const service = await ServiceServices.getSingleService(id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Get single service successfully",
        data: service
    })
} )

const updateService = catchAsync(async (req, res, next) =>{
    const serviceId = req.params.id as string;
    const payload = req.body;
    const service = await ServiceServices.updateService(serviceId, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Service updated successfully",
        data: service
    })
})

const deleteService = catchAsync(async ( req: Request, res: Response, next: NextFunction) =>{
    const id = req.params.id as string;
    await ServiceServices.deleteService(id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Service deleted successfully",
        data: null
    })
} )


export const ServiceControllers = {
    createService,
    getAllServices,
    updateService,
    getSingleService,
    deleteService
}