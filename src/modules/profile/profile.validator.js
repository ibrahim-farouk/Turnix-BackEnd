import { z } from "zod";
import { phoneRegex } from "../../common/utils/regex.js";

export const updateProfileSchema = z.object({
    body: z.object({
        fullName: z
            .string()
            .trim()
            .min(3, "Full name must be at least 3 characters.")
            .max(100, "Full name must not exceed 100 characters.")
            .optional(),

        phone: z
            .string()
            .trim()
            .regex(/^01[0125][0-9]{8}$/, "Invalid Egyptian phone number.")
            .optional(),

        jobTitle: z
            .string()
            .trim()
            .min(2, "Job title must be at least 2 characters.")
            .max(100, "Job title must not exceed 100 characters.")
            .optional(),
    })
})

export const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z
            .string()
            .min(8, "Current password is required."),

        newPassword: z
            .string()
            .min(8, "New password must be at least 8 characters."),

        confirmPassword: z
            .string()
            .min(8, "Confirm password is required.")
    })
}).refine(
    (data) => data.body.newPassword === data.body.confirmPassword,
    {
        path: ["body", "confirmPassword"],
        message: "Passwords do not match."
    }
);