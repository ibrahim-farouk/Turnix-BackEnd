import { z } from "zod";

export const serviceSchema = z.object({
    params: z.object({
        branchId: z
            .string({
                required_error: "Branch ID is required",
                invalid_type_error: "Branch ID must be a string",
            })
            .trim()
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid Branch ID"),
    })
})