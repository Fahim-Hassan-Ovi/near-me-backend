import z from "zod";

export const createUserZodSchema = z.object({
            name: z.string()
                .min(1, { message: "Name is required" })
                .min(2, { message: "Name is too short. Minimum 2 character long" })
                .max(50, { message: "Name is too long" }),
            email: z.string()
                .email({ message: "Invalid email address" })
                .min(5, { message: "Email must be at least 5 characters long" })
                .max(100, { message: "Email cannot exceed 100 characters" }),
            password: z.string()
                .min(1, { message: "Password is required" })
                .min(8, { message: "Password must be at least 8 characters long" })
                .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
                .regex(/\d/, { message: "Password must contain at least one digit" })
                .regex(/[^A-Za-z0-9]/, {
                    message: "Password must contain at least one special character",
                }),
            phone: z.string()
                .regex(/^(\+8801|01)[3-9]\d{8}$/, {
                    message:
                        "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
                })
                .optional(),
            address: z.string()
                .min(1, { message: "Address is required" })
                .max(200, { message: "Address cannot exceed 200 characters." })
                .optional()

        })