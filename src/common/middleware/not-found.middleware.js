import AppError from "../errors/app-error.js";
import { ERROR_CODES } from "../utils/constants.js";

export const notFound = (req, res, next) => {
    next(new AppError(`Route ${req.originalUrl} not found`, 404, ERROR_CODES.NOT_FOUND));
};

