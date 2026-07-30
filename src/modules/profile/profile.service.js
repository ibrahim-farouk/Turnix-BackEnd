import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";

import profileRepository from "./profile.repository.js";
import AppError from "../../common/errors/app-error.js";

import { ERROR_CODES } from "../../common/utils/constants.js";

export const getProfile = async (req) => {
    const user = await profileRepository.findById(req.user.id);
    if (!user) {
        throw new AppError(
            "User not found.",
            404,
            ERROR_CODES.USER_NOT_FOUND
        );
    }

    return user;
};

export const updateProfile = async (req) => {
    const { fullName, phone, jobTitle } = req.body;
    const user = await profileRepository.findById(req.user.id);
    if (!user) {
        throw new AppError(
            "User not found.",
            404,
            ERROR_CODES.USER_NOT_FOUND
        );
    }
    if (phone && phone !== user.phone) {
        const existPhone = await profileRepository.findByPhone(phone);
        if (existPhone && existPhone._id.toString() !== req.user.id) {
            throw new AppError(
                "Phone already exists.",
                409,
                ERROR_CODES.PHONE_ALREADY_EXISTS
            );
        }
    }
    const updateData = {};

    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    const updatedUser = await profileRepository.updateProfile(req.user._id, updateData);
    return updatedUser;
};

export const changePassword = async (req) => {
    const {
        currentPassword,
        newPassword,
    } = req.body;
    const user = await profileRepository.findByIdWithPassword(req.user.id);
    if (!user) {
        throw new AppError(
            "User not found.",
            404,
            ERROR_CODES.USER_NOT_FOUND
        );
    }
    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordMatch) {
        throw new AppError(
            "Current password is incorrect.",
            400,
            ERROR_CODES.INVALID_PASSWORD
        );
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await profileRepository.updatePassword(req.user.id, hashedPassword);
    return;
};

export const updateProfilePicture = async (req) => {
    const user = await profileRepository.findById(req.user.id);
    if (!user) {
        throw new AppError(
            "User not found.",
            404,
            ERROR_CODES.USER_NOT_FOUND
        );
    }
    if (!req.file) {
        throw new AppError(
            "No file uploaded.",
            400,
            ERROR_CODES.FILE_REQUIRED
        );
    }
    if (user.profileImage) {
        const oldImagePath = path.join(
            process.cwd(),
            "src",
            user.profileImage
        );

        await fs.promises.unlink(oldImagePath).catch(() => {});
    }
    const imagePath = path.join("uploads", "profiles", req.file.filename);
    const updatedUser = await profileRepository.updateProfilePicture(req.user.id, imagePath);
    return updatedUser;
};