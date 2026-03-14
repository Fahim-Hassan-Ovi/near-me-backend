import z from "zod";

/**
 * Location Validation
 */
const locationZodSchema = z.object({
    type: z.literal("Point"),

    coordinates: z
        .array(z.number())
        .length(2, { message: "Coordinates must contain [longitude, latitude]" }),

    address: z
        .string()
        .max(200, { message: "Address cannot exceed 200 characters" })
        .optional(),
});

/**
 * Time format validation (HH:mm)
 */
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Create Service Validation
 */
export const createServiceZodSchema = z.object({
    service_name: z
        .string()
        .min(2, { message: "Service name must be at least 2 characters long" })
        .max(100, { message: "Service name cannot exceed 100 characters" }),

    service_category: z
        .string()
        .min(1, { message: "Category is required" }),

    offer_services: z
        .array(z.string())
        .min(1, { message: "At least one offered service is required" }),

    phone: z
        .string()
        .regex(/^(\+8801|01)[3-9]\d{8}$/, {
            message:
                "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
        }),

    service_address: z
        .string()
        .min(5, { message: "Service address is required" })
        .max(200, { message: "Address cannot exceed 200 characters" }),

    about: z
        .string()
        .min(10, { message: "About section must be at least 10 characters long" })
        .max(1000, { message: "About cannot exceed 1000 characters" }),

    website_link: z
        .string(),
    // .url({ message: "Invalid website URL" }),

    location: locationZodSchema,

    media: z
        .array(z.string().url({ message: "Each media must be a valid URL" }))
        .max(6, { message: "Maximum 6 images allowed" })
        .optional(),

    company_logo: z
        .string()
        .url({ message: "Company logo must be a valid URL" }),

    openingTime: z
        .string()
        .regex(timeRegex, { message: "Opening time must be in HH:mm format" }),

    closingTime: z
        .string()
        .regex(timeRegex, { message: "Closing time must be in HH:mm format" }),

    allTimeAvailability: z.boolean(),
});

/**
 * Update Service Validation
 */
export const updateServiceZodSchema = z.object({
    service_name: z
        .string()
        .min(2, { message: "Service name must be at least 2 characters long" })
        .max(100)
        .optional(),

    service_category: z
        .string()
        .min(2, { message: "Service category is required" })
        .max(50)
        .optional(),

    offer_services: z
        .array(z.string())
        .optional(),

    phone: z
        .string()
        .regex(/^(\+8801|01)[3-9]\d{8}$/, {
            message:
                "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
        })
        .optional(),

    service_address: z
        .string()
        .max(200)
        .optional(),

    about: z
        .string()
        .max(1000)
        .optional(),

    website_link: z
        .string()
        .url({ message: "Invalid website URL" })
        .optional(),

    location: locationZodSchema.optional(),

    media: z
        .array(z.string().url())
        .optional(),

    company_logo: z
        .string()
        .url()
        .optional(),

    openingTime: z
        .string()
        .regex(timeRegex, { message: "Opening time must be in HH:mm format" })
        .optional(),

    closingTime: z
        .string()
        .regex(timeRegex, { message: "Closing time must be in HH:mm format" })
        .optional(),

    allTimeAvailability: z.boolean().optional(),
});