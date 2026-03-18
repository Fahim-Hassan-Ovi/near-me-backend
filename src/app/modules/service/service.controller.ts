/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { ServiceServices } from "./service.service";
import { IService } from "./service.interface";

// const createTour = catchAsync(async (req: Request, res: Response) => {
//     const payload: ITour = {
//         ...req.body,
//         images: (req.files as Express.Multer.File[]).map(file => file.path)
//     }
//     const result = await TourService.createTour(payload);
//     sendResponse(res, {
//         statusCode: 201,
//         success: true,
//         message: 'Tour created successfully',
//         data: result,
//     });
// });

const createService = catchAsync(async (req: Request, res: Response) => {

  const files = req.files as {
    media?: Express.Multer.File[];
    company_logo?: Express.Multer.File[];
  };

  const payload: IService = {
    ...req.body,

    media: files?.media?.map(file => file.path) || [],

    company_logo: files?.company_logo?.[0]?.path || ""
  };


  const service = await ServiceServices.createService(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Service created successfully",
    data: service
  });
});
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