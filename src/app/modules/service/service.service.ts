/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import { Service } from "./service.model";
import { IService } from "./service.interface";
import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { serviceSearchableFields } from "./service.constant";
import { enforceOfferServicesLimit } from "../../utils/subscriptionHelper/enforceCategoryLimit";
import { enforcePhotoLimit } from "../../utils/subscriptionHelper/enforcePhotoLimit";
import { Role } from "../user/user.interface";

const createService = async (payload: Partial<IService>, userId: string) => {
  // 1) one shop per provider
  const existingService = await Service.findOne({ provider: userId });

  if (existingService) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "A provider can create only one shop"
    );
  }

  // 2) offer services limit based on plan
  const offerServicesCount = payload.offer_services?.length || 0;
  await enforceOfferServicesLimit(userId, offerServicesCount);

  // 3) photo limit based on plan
  const incomingPhotosCount = payload.media?.length || 0;
  await enforcePhotoLimit(userId, 0, incomingPhotosCount);

  // 4) create
  const service = await Service.create({
    ...payload,
    provider: userId,
  });

  return service;
};

const getAllServices = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(
    Service.find()
      .populate("service_category")
      .populate("offer_services")
      .populate("provider", "name email subscriptionInfo"),
    query
  );

  const servicesData = queryBuilder
    .filter()
    .search(serviceSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    servicesData.build(),
    queryBuilder.getMeta(),
  ]);

  // sort by subscription priority
  const sortedData = [...data].sort((a: any, b: any) => {
    const aScore = a?.provider?.subscriptionInfo?.priorityScore || 0;
    const bScore = b?.provider?.subscriptionInfo?.priorityScore || 0;
    return bScore - aScore;
  });

  return {
    data: sortedData,
    meta,
  };
};

const getSingleService = async (id: string) => {
  const service = await Service.findById(id)
    .populate("service_category")
    .populate("offer_services")
    .populate("provider", "name email subscriptionInfo");

  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, "Service is not found");
  }

  return service;
};

const updateService = async (
  id: string,
  payload: Partial<IService>,
  user: any
) => {
  const service = await Service.findById(id);

  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, "Service not found");
  }

  // provider can edit only own shop
  if (
    user.role === Role.PROVIDER &&
    service.provider?.toString() !== user.userId.toString()
  ) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
  }

  // if offer services updated, validate plan limit
  if (payload.offer_services) {
    await enforceOfferServicesLimit(user.userId, payload.offer_services.length);
  }

  // if media updated, validate photo limit
  if (payload.media) {
    await enforcePhotoLimit(user.userId, 0, payload.media.length);
  }

  const updatedService = await Service.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .populate("service_category")
    .populate("offer_services")
    .populate("provider", "name email subscriptionInfo");

  return updatedService;
};

const deleteService = async (id: string, user: any) => {
  const service = await Service.findById(id);

  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, "Service is not found");
  }

  if (
    user.role === Role.PROVIDER &&
    service.provider?.toString() !== user._id.toString()
  ) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
  }

  await Service.findByIdAndDelete(id);
};

export const ServiceServices = {
  createService,
  getSingleService,
  getAllServices,
  updateService,
  deleteService,
};