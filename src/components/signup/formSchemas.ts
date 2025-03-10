
import { z } from "zod";
import { UserRole } from "@/utils/types";

// Basic information schema (Step 1)
export const basicInfoSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  phoneNumber: z.string().min(5, { message: "Invalid phone number" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

// Additional details schema (Step 2)
export const additionalInfoSchema = z.object({
  businessName: z.string().min(2, { message: "Business name is required" }),
  govtCredential: z.string().min(2, { message: "Government credential is required" }),
});

// Combined schema for the entire form
export const signUpSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  phoneNumber: z.string().min(5, { message: "Invalid phone number" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  businessName: z.string().min(2, { message: "Business name is required" }),
  govtCredential: z.string().min(2, { message: "Government credential is required" }),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type BasicInfoValues = z.infer<typeof basicInfoSchema>;
export type AdditionalInfoValues = z.infer<typeof additionalInfoSchema>;
