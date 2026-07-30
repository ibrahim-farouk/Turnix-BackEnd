import { Branch } from "../../models/index.js";

export const findActiveBranches = async () => {
    return await Branch.find({ isActive: true })
        .select("_id name")
        .sort({ name: 1 })
        .lean(); // Return plain JavaScript objects
};

export const findById = async (branchId) => Branch.findById(branchId);