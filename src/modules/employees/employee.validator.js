import { z } from "zod";
import { objectIdRegex, phoneRegex } from "../../common/utils/regex.js";

export const createEmployeeSchema = z.object({
    body: z.object({
        fullName: z
            .string()
            .trim()
            .min(3, "Full name is required")
            .max(100, "Full name must be less than 100 characters"),

        jobTitle: z
            .string()
            .trim()
            .min(2, "Job title is required")
            .max(100, "Job title must be less than 100 characters"),

        email: z
            .string()
            .trim()
            .email("please enter a valid email address")
            .transform((email) => email.toLowerCase()),

        phone: z
            .string()
            .trim()
            .regex(phoneRegex, "Invalid phone number"),

        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(100, "Password must be less than 100 characters"),

        branchId: z
            .string()
            .trim()
            .regex(objectIdRegex, "Invalid Branch ID"),

        serviceId: z
            .string()
            .trim()
            .regex(objectIdRegex, "Invalid Service ID"),

        counterNumber: z
            .number()
            .int()
            .positive("Counter number must be a positive number")
    }),

    params: z.any().optional(),
    query: z.any().optional()
})

export const updateEmployeeSchema = z.object({
    body: z.object({
        fullName: z
            .string()
            .trim()
            .min(3)
            .max(100)
            .optional(),

        phone: z
            .string()
            .regex(phoneRegex)
            .optional(),

        branchId: z
            .string()
            .regex(objectIdRegex)
            .optional(),

        serviceId: z
            .string()
            .regex(objectIdRegex)
            .optional(),

        counterNumber: z
            .number()
            .int()
            .positive()
            .optional(),
        
        status: z
            .enum(["ACTIVE", "INACTIVE"])
            .optional()
    }),

    params: z.object({
        id: z
            .string()
            .trim()
            .regex(objectIdRegex, "Invalid Employee ID"),
    }),

    query: z.any().optional()

})

export const resetEmployeePasswordSchema = z.object({
    body: z.object({
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(100, "Password must be less than 100 characters"),
    }),
    params: z.object({
        id: z
            .string()
            .trim()
            .regex(objectIdRegex, "Invalid Employee ID"),
    }),
    query: z.any().optional()
})

export const employeeIdSchema = z.object({
    params: z.object({
        id: z
            .string()
            .trim()
            .regex(objectIdRegex, "Invalid Employee ID"),
    }),
    body: z.any().optional(),
    query: z.any().optional()
}) 

export const employeeListQuerySchema = z.object({
    query: z.object({
        page: z
            .coerce.number().int().positive().default(1),

        limit: z
            .coerce.number().int().positive().max(100).default(10),

        search: z
            .string()
            .trim()
            .optional(),
        
        branch: z
            .string()
            .trim()
            .regex(objectIdRegex, "Invalid Branch ID")
            .optional(),

        status: z
            .enum(["ACTIVE", "INACTIVE"])
            .optional(),
    }),
    params: z.any().optional(), 
    body: z.any().optional(),
});