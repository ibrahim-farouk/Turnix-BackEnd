import { z } from "zod";

const objectIdSchema = z
    .string({
        required_error: "ID is required",
        invalid_type_error: "ID must be a string"
    })
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

export const createTicketSchema = z.object({
    body: z.object({
        branchId: objectIdSchema,

        serviceId: objectIdSchema,
        
        customerName: z.string({
            required_error: "Customer name is required",
            invalid_type_error: "Customer name must be a string",
        })
            .trim()
            .min(2, "Customer name is required")
            .max(100, "Customer name must be less than 100 characters"),

        customerPhone: z
            .string({
                required_error: "Customer phone is required",
                invalid_type_error: "Customer phone must be a string"
            })
            .trim()
            .regex(
                /^01[0125][0-9]{8}$/,
                "Please enter a valid Egyptian phone number"
            ),
        
    })
});

export const ticketIdSchema = z.object({
    params: z.object({
        ticketId: objectIdSchema
    })
});