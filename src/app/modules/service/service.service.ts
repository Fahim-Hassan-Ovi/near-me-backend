import httpStatus from "http-status-codes";
import { Service } from "./service.model";
import { IService } from "./service.interface";
import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { serviceSearchableFields } from "./service.constant";

const createService = async (payload: Partial<IService>) => {
    const service = await Service.create(payload);

    return service;
}

const getAllServices = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(Service.find(), query)
    const servicesData = queryBuilder
        .filter()
        .search(serviceSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        servicesData.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
};

const getSingleService = async (id: string) => {
    const service = await Service.findById(id);

    if (!service) {
        throw new AppError(httpStatus.NOT_FOUND, "Service is not found")
    }
    return service;
}

const updateService = async (id: string, payload: Partial<IService>) => {
    const service = await Service.findById(id);

    if (!service) {
        throw new AppError(httpStatus.NOT_FOUND, "Service not found");
    }

    const updatedService = await Service.findByIdAndUpdate(
        id,
        payload,
        { new: true, runValidators: true }
    )

    return updatedService;
}

const deleteService = async (id: string) => {
    const service = await Service.findByIdAndDelete(id);

    if (!service) {
        throw new AppError(httpStatus.NOT_FOUND, "Service is not found")
    }
}

export const ServiceServices = {
    createService,
    getSingleService,
    getAllServices,
    updateService,
    deleteService
}