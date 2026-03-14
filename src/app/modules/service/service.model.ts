import { model, Schema } from "mongoose";
import { ILocation, IService } from "./service.interface";

const locationSchema = new Schema<ILocation>({
    type: {
    type: String,
    enum: ["Point"],
    required: true,
    default: "Point",
  },
  coordinates: {
    type: [Number],
    required: true,
  },
  address: {
    type: String,
  },
})

const serviceSchema = new Schema<IService>({
    service_name: { type: String, required: true },
    service_category: { type: String, required: true },
    offer_services: { type: [String], required: true, default: [] },
    phone: { type: Number, required: true },
    service_address: { type: String, required: true },
    about: { type: String, required: true },
    website_link: { type: String, required: true },
    location: locationSchema,
    media: { type: [String], required: true, default: [] },
    company_logo: { type: String, required: true },
    openingTime: { type: String, required: true },
    closingTime: { type: String, required: true },
    allTimeAvailability: { type: Boolean, required: true },
})

export const Service = model<IService>("Service", serviceSchema);