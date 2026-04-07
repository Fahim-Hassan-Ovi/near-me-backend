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
  provider: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // ✅ one shop per provider
  },
  service_name: { type: String, required: true },
  service_category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  offer_services: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
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