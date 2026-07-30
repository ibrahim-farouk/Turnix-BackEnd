import { User } from "../../models/index.js";

export const findUserByEmail = async (email) => {
    return await User.findOne({ email })
        .select("+password")
        .populate("branch", "name")
        .populate("service", "name prefix");
}

export const findByPhone = async (phone) => {
    return await User.findOne({ phone });
}

export const updateLastLogin = async (userId) => {
    return await User.findByIdAndUpdate(
        userId,
        { lastLogin: new Date() },
        { new: true }
    );
};