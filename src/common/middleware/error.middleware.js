import multer from "multer";

import {
    API_RESPONSE,
    ERROR_CODES
} from "../utils/constants.js";

import AppError from "../errors/app-error.js";

export const errorHandler = (err, req, res, next) => {

    // Multer File Size Error
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            err = new AppError(
                "File size must not exceed 5 MB.",
                400,
                ERROR_CODES.FILE_TOO_LARGE
            );
        }
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong";
    const errorCode =
        err.errorCode || ERROR_CODES.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
        status: API_RESPONSE.ERROR,
        error: {
            code: errorCode,
            message,
            ...(err.errors ? { details: err.errors } : {})
        }
    });
};