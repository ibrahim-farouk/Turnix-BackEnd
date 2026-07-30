import jwt from "jsonwebtoken";
import { User } from "../../models/index.js";
import AppError from "../errors/app-error.js";
import { env } from "../../config/env.js";
import { ERROR_CODES, USER_STATUS } from "../utils/constants.js";

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(new AppError("Authentication required", 401, ERROR_CODES.UNAUTHORIZED));
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, env.jwtSecret);

        const user = await User.findById(decoded.userId);

        if(!user) {
            return next(new AppError("User not found", 401, ERROR_CODES.UNAUTHORIZED));
        }

        if(user.status !== USER_STATUS.ACTIVE) {
            return next(new AppError("User is not active", 403, ERROR_CODES.FORBIDDEN));
        }

        req.user = user;
        next(); // Pass the request to the next middleware

    }
    catch (error) {
        if(
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return next(
                new AppError("Invalid token", 401, ERROR_CODES.UNAUTHORIZED)
            );
        }
        next(error);
    }
}