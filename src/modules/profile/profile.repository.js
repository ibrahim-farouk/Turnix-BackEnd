import { User } from "../../models/index.js";

const findById = (userId) => {
    return User.findById(userId)
        .populate("branch", "name")
        .populate("service", "name")
        .select("-password");
};

const findByIdWithPassword = (userId) => {
    return User.findById(userId).select("+password");
}
const findByPhone = (phone) => User.findOne({ phone });

const updateProfile = (userId, updateData) => {
    return User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
    )
        .select("-password")
        .populate("branch", "name")
        .populate("service", "name");
};

const updatePassword = (userId, hashedPassword) => {
    return User.findByIdAndUpdate(
        userId,
        { password: hashedPassword, mustChangePassword: false },
        { new: true }
    )
};

const updateProfilePicture = (userId, imagePath) => {
    return User.findByIdAndUpdate(userId, { profileImage: imagePath }, { new: true })
        .populate("branch", "name")
        .populate("service", "name")
        .select("-password");
};

export default {
    findById,
    findByIdWithPassword,
    findByPhone,
    updateProfile,
    updatePassword,
    updateProfilePicture
};