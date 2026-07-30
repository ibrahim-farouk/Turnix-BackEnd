import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const workspaceQuerySchema = z.object({
    query: z.object({
        branchId: z
            .string()
            .trim()
            .regex(objectIdRegex, "Invalid Branch ID")
            .optional(),
        serviceId: z
            .string()
            .trim()
            .regex(objectIdRegex, "Invalid Service ID")
            .optional(),
    }),
    body: z.any().optional(),
    params: z.any().optional(), 
})

export const workspaceTicketIdSchema = z.object({
    params: z.object({
        ticketId: z
            .string()
            .trim()
            .regex(objectIdRegex, "Invalid Ticket ID"),
    }),
    body: z.any().optional(),
    query: z.any().optional()
})