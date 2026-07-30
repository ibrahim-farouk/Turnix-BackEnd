import { Setting } from "../../models/index.js";

export const findSettings = () => {
    return Setting.findOne();
};

export const createSettings = (data) => {
    return Setting.create(data);
};

export const updateSettings = (id, data) => {
    return Setting.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });
};