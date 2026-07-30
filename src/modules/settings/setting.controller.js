import {
    getSettings,
    updateSettings,
} from "./setting.service.js";

import { API_RESPONSE } from "../../common/utils/constants.js";

export const getSettingsController = async (req, res, next) => {
    try {
        const settings = await getSettings();

        res.status(200).json({
            status: API_RESPONSE.SUCCESS,
            data: settings,
        });
    } catch (error) {
        next(error);
    }
};

export const updateSettingsController = async (req, res, next) => {
    try {
        const settings = await updateSettings(req);

        res.status(200).json({
            status: API_RESPONSE.SUCCESS,
            message: "Settings updated successfully.",
            data: settings,
        });
    } catch (error) {
        next(error);
    }
};