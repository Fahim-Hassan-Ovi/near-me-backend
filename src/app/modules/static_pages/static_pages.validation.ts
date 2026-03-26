import { z } from "zod";

/* ---------------- ABOUT US ---------------- */
export const createAboutUsZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, "About Us content is required"),
  }),
});

export const updateAboutUsZodSchema = createAboutUsZodSchema;


/* ---------------- CONTACT US ---------------- */
export const createContactUsZodSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
    phone: z.string().min(5, "Phone is required"),
    address: z.string().min(1, "Address is required"),
  }),
});

export const updateContactUsZodSchema = createContactUsZodSchema;


/* ---------------- HELP SUPPORT ---------------- */
export const createHelpSupportZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Help Support content is required"),
  }),
});

export const updateHelpSupportZodSchema = createHelpSupportZodSchema;


/* ---------------- PRIVACY POLICY ---------------- */
export const createPrivacyPolicyZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Privacy Policy content is required"),
  }),
});

export const updatePrivacyPolicyZodSchema = createPrivacyPolicyZodSchema;


/* ---------------- TERMS CONDITION ---------------- */
export const createTermsConditionZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Terms & Condition content is required"),
  }),
});

export const updateTermsConditionZodSchema = createTermsConditionZodSchema;