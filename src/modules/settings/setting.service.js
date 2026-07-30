import * as settingsRepository from "./setting.repository.js";

export const getSettings = async () => {
    let settings = await settingsRepository.findSettings();

    if (!settings) {
        settings = await settingsRepository.createSettings({
            defaultServiceTime: 15,
        });
    }

    return settings;
};

export const updateSettings = async (req) => {
    let settings = await settingsRepository.findSettings();

    if (!settings) {
        settings = await settingsRepository.createSettings({
            defaultServiceTime: 15,
        });
    }

    settings = await settingsRepository.updateSettings(
        settings._id,
        req.body
    );

    return settings;
};

export default {
    getSettings,
    updateSettings,
};