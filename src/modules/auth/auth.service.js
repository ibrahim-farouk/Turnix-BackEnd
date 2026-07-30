import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
    findUserByEmail,
    updateLastLogin
} from "./auth.repository.js";
import AppError from "../../common/errors/app-error.js";
import {
    ERROR_CODES,
    JWT,
    USER_STATUS
} from "../../common/utils/constants.js";
import { env } from "../../config/env.js";

export const login = async ({ email, password, rememberMe = false }) => {
    // 1. find user
    const user = await findUserByEmail(email);
    // 2. check user exists
    if (!user) {
        throw new AppError("Invalid email or password", 401, ERROR_CODES.UNAUTHORIZED);
    }
    // 3. check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new AppError("Invalid email or password", 401, ERROR_CODES.UNAUTHORIZED);
    }
    // 4. check account status
    if (user.status !== USER_STATUS.ACTIVE) {
        throw new AppError("Your account is inactive", 403, ERROR_CODES.FORBIDDEN);
    }
    // 5. Determine token expiration
    const expiresIn = rememberMe ? JWT.REMEMBER_ME_EXPIRES_IN : JWT.DEFAULT_EXPIRES_IN;
    // 6. generate token
    const token = jwt.sign(
        {
            userId: user._id.toString(),
            role: user.role
        }, env.jwtSecret,
        {
            expiresIn
        }
    );

    // 7. update last login
    await updateLastLogin(user._id);

    // Build Safe response
    const safeUser = {
        id: user._id.toString(),
        employeeId: user.employeeId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        branch: user.branch ? {
            id: user.branch._id.toString(),
            name: user.branch.name
        } : null,
        service: user.service ? {
            id: user.service._id.toString(),
            name: user.service.name
        } : null,
        counterNumber: user.counterNumber,
    };

    return {
        token,
        user: safeUser
    }
};