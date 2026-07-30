import {
    getProfile,
    updateProfile,
    changePassword,
    updateProfilePicture
} from "./profile.service.js";

import { toProfileResponse } from "./profile.mapper.js";

import { API_RESPONSE } from "../../common/utils/constants.js";

export const getProfileController = async (req, res, next) => {
    try {
        const profile = await getProfile(req);
        res.status(200).json({ status: API_RESPONSE.SUCCESS, message: "Profile fetched successfully", data: toProfileResponse(req, profile) });
    } catch (err) {
        next(err);
    }
};

export const updateProfileController = async (req, res, next) => {
    try {
        const profile = await updateProfile(req);
        res.status(200).json({ status: API_RESPONSE.SUCCESS, message: "Profile updated successfully", data: toProfileResponse(req, profile) });
    } catch (err) {
        next(err);
    }
};

export const changePasswordController = async (req, res, next) => {
    try {
        await changePassword(req);
        res.status(200).json({ status: API_RESPONSE.SUCCESS, message: "Password changed successfully" });
    } catch (err) {
        next(err);
    }
};

export const updateProfilePictureController = async (req, res, next) => {
    try {
        const profile = await updateProfilePicture(req);
        res.status(200).json({ status: API_RESPONSE.SUCCESS, message: "Profile picture updated successfully", data: toProfileResponse(req, profile) });
    } catch (err) {
        next(err);
    }
};

