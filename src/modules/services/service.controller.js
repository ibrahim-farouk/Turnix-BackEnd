import * as serviceService from "./service.service.js";

export const getBranchServices = async (req, res, next) => {
    try {
        const { branchId } = req.params;
        const services = await serviceService.getBranchServices(branchId);
        res.status(200).json({
            success: true,
            data: services
        });
    } catch (error) {
        next(error);
    }
};