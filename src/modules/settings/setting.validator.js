import { z } from "zod";

export const updateSettingsSchema = z.object({
    body: z.object({
        defaultServiceTime: z
            .number({
                required_error: "Default service time is required.",
                invalid_type_error: "Default service time must be a number.",
            })
            .int("Default service time must be an integer.")
            .min(1, "Default service time must be at least 1 minute."),
    }),
});