import { Service } from "../../models/index.js";


export const findActiveServicesByBranch = async (branchId) => {
    return await Service.find({ branch: branchId, isActive: true })
        .select("_id name prefix")
        .sort({ name: 1 })
        .lean();
}

export const findById = async (serviceId) => Service.findById(serviceId);
