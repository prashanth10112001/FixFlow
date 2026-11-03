import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must not exceed 255 characters"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password must not exceed 72 characters"),

  phone: z
    .string()
    .trim()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long")
    .optional()
    .or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;
