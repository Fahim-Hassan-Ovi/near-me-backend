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
import { User } from "../user/user.model";
import { Review } from "../review/review.model";
import { buildServiceMeta } from "../../utils/getNearestServicesHelper/buildServiceMeta";
import { buildGeoQuery } from "../../utils/getNearestServicesHelper/getNearestServicesQuery";


// ─── Shared: aggregate ratings for a list of serviceIds ───────────────────────
const aggregateRatings = async (serviceIds: any[]) => {
  const ratingAggregates = await Review.aggregate([
    {
      $match: {
        service: { $in: serviceIds },
        parentReview: null,
        rating: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: "$service",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  return new Map(ratingAggregates.map((r) => [r._id.toString(), r]));
};

// ─── Shared: slim select + provider populate ──────────────────────────────────
const SERVICE_SELECT =
  "_id service_name company_logo location openingTime closingTime allTimeAvailability";
const PROVIDER_SELECT =
  "subscriptionInfo.planName subscriptionInfo.badgeType subscriptionInfo.priorityScore";

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

  // await User.findByIdAndUpdate(
  //   userId,
  //   {
  //     $push: { service: service._id },
  //   },
  //   { new: true }
  // );

  await User.findByIdAndUpdate(
    userId,
    {
      service: service._id, // ✅ direct assignment
    },
    { returnDocument: "after" }
  );


  // Update hasService to true once a service is created
  await User.findByIdAndUpdate(userId, { hasService: true });

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


// Get Nearest Services
const getNearestServices = async (
  lon: string,
  lat: string,
  minRating?: number,
  radius?: number,
  categories?: string | string[]
) => {
  if (!lat || !lon) {
    throw new AppError(httpStatus.BAD_REQUEST, "Location not provided");
  }

  const userLon = parseFloat(lon);
  const userLat = parseFloat(lat);
  const radiusInMeters = (radius ?? 10) * 1609.34;

  const services = await Service.find(
    buildGeoQuery(userLon, userLat, radiusInMeters, categories)
  )
    .select(SERVICE_SELECT)
    .populate("provider", PROVIDER_SELECT);

  const ratingMap = await aggregateRatings(services.map((s) => s._id));

  let result = services.map((service) =>
    buildServiceMeta(service, ratingMap, userLon, userLat)
  );

  if (minRating) {
    result = result.filter((s) => s.averageRating >= minRating);
  }

  result.sort((a, b) => b.provider.priorityScore - a.provider.priorityScore);

  return result;
};


// Search services by name with location and rating meta 

const searchServices = async (
  lon: string,
  lat: string,
  searchTerm: string,
  limit?: number
) => {
  if (!lat || !lon) {
    throw new AppError(httpStatus.BAD_REQUEST, "Location not provided");
  }

  const userLon = parseFloat(lon);
  const userLat = parseFloat(lat);

  const services = await Service.find({
    // service_name: { $regex: searchTerm, $options: "i" },
    service_name: { $regex: `\\b${searchTerm}`, $options: "i" }
  })
    .select(SERVICE_SELECT)
    .populate("provider", PROVIDER_SELECT);

  const ratingMap = await aggregateRatings(services.map((s) => s._id));

  let result = services.map((service) =>
    buildServiceMeta(service, ratingMap, userLon, userLat)
  );

  // Sort by priorityScore before slicing
  result.sort((a, b) => b.provider.priorityScore - a.provider.priorityScore);

  const total = result.length;

  if (limit) {
    result = result.slice(0, limit);
  }

  return { data: result, total, showing: result.length };
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
  // console.log("this is from delete", user, user.userId)
  if (!user || !user.userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const service = await Service.findById(id);

  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, "Service is not found");
  }

  if (
    user.role === Role.PROVIDER &&
    service.provider &&
    service.provider.toString() !== user.userId.toString()
  ) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
  }

  await Service.findByIdAndDelete(id);

  if (service.provider) {
    await User.findByIdAndUpdate(service.provider, { hasService: false });
  }
};

export const ServiceServices = {
  createService,
  getSingleService,
  getAllServices,
  getNearestServices,
  searchServices,
  updateService,
  deleteService,
};