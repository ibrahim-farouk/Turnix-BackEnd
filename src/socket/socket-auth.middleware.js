import jwt from "jsonwebtoken";

import { User } from "../models/index.js";
import { env } from "../config/env.js";
import { USER_STATUS, ERROR_CODES } from "../common/utils/constants.js";
import AppError from "../common/errors/app-error.js";

// Socket.IO authentication middleware.
//
// Re-uses the exact same JWT verification path as
// `src/common/middleware/auth.middleware.js`:
//   * same secret (`env.jwtSecret`)
//   * same User model
//   * same ACTIVE status check
//
// On success, populates `socket.data` with the identity context that event
// handlers and room joins will rely on. Never trusts client-supplied role /
// branch / service — those come from the DB user document.
export const socketAuth = async (socket, next) => {
    try {
        const token = socket.handshake?.auth?.token;

        if (!token) {
            throw new AppError(
                "Authentication required.",
                401,
                ERROR_CODES.UNAUTHORIZED
            );
        }

        const decoded = jwt.verify(token, env.jwtSecret);

        const user = await User.findById(decoded.userId);

        if (!user) {
            throw new AppError(
                "User not found.",
                401,
                ERROR_CODES.UNAUTHORIZED
            );
        }

        if (user.status !== USER_STATUS.ACTIVE) {
            throw new AppError(
                "User is not active.",
                403,
                ERROR_CODES.FORBIDDEN
            );
        }

        socket.data.userId = user._id.toString();
        socket.data.role = user.role;
        socket.data.branch = user.branch ? user.branch.toString() : null;
        socket.data.service = user.service ? user.service.toString() : null;

        next();
    } catch (err) {
        if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
            return next(new AppError(err.message, 401, ERROR_CODES.UNAUTHORIZED));
        }
        next(err);
    }
};
