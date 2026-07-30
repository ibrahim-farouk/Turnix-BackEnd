import { findActiveServicesByBranch } from "./service.repository.js";

export const getBranchServices = async (branchId) => {
    const services = await findActiveServicesByBranch(branchId);

    return services.map((service) => ({
        _id: service._id.toString(),
        name: service.name,
        prefix: service.prefix
    }));
};