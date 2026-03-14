import {Types} from "mongoose";

export interface ILocation {
  type: "Point";
  coordinates: [number, number];
  address?: string;
}

export interface IService {
    id?: Types.ObjectId;
    service_name?: string;
    service_category?: string;
    offer_services?: string[];
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