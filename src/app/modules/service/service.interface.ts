import {Types} from "mongoose";

export interface ILocation {
  type: "Point";
  coordinates: [number, number];
  address?: string;
}

export interface IService {
    id?: Types.ObjectId;
    provider?: Types.ObjectId;
    service_name?: string;
    service_category?: Types.ObjectId;
    offer_services?: Types.ObjectId[];
    // reviews?: Types.ObjectId[];
    phone?: number;
    service_address?: string;
    about?: string;
    website_link?: string;
    location: ILocation;
    media?: string[];
    company_logo?: string;
    openingTime: string;
    closingTime: string;
    allTimeAvailability: boolean; 
}