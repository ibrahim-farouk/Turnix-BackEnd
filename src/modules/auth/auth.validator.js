import { z } from "zod";

export const loginSchema = z.object({
    body: z.object({
        email: z.string({
            required_error: "Email is required",
            invalid_type_error: "Email must be a string",
        }).trim().min(1, "Email is required")
            .email("please enter a valid email address")
            .transform((email) => email.toLowerCase()),

        password: z.string({
            required_error: "Password is required",
            invalid_type_error: "Password must be a string",
        }).min(1, "Password is required"),

        rememberMe: z.boolean({
            invalid_type_error: "Remember me must be a boolean",
        }).optional().default(false),
    })

});