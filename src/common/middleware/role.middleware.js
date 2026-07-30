import AppError from "../errors/app-error.js";
import { ERROR_CODES } from "../utils/constants.js";

export const authorize = (...allowRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowRoles.includes(req.user.role)) {
            return next(
                new AppError("You do not have permission to perform this action", 403, ERROR_CODES.FORBIDDEN)
            );
        }
        next();
    };
};
