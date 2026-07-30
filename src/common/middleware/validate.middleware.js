import { ZodError } from "zod";
import AppError from "../errors/app-error.js";
import { ERROR_CODES } from "../utils/constants.js";

// Middleware to validate request
export const validate = (schema) => async (req, res, next) => {
    try {
        const validated = await schema.parseAsync({ 
            body: req.body,
            query: req.query,
            params: req.params,
        });

        if (validated.body) {
            req.body = validated.body;
        }

        if (validated.query) {
            req.query = validated.query;
        }

        if (validated.params) {
            req.params = validated.params;
        }

        next();
    } catch (error) {
        if (error instanceof ZodError) {
            const errors = error.issues.map((issue) => ({
                field: issue.path.join(".").replace(/^body\./, ""),
                message: issue.message,
            }))

            const validationError = new AppError(
                "Validation failed",
                400,
                ERROR_CODES.VALIDATION_ERROR
            );
            validationError.errors = errors;
            return next(validationError);
        }
        next(error);
    }
};