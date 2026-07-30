import * as branchService from "./branches.service.js";

export const getBranches = async (req, res, next) => {
    try {
        const branches = await branchService.getBranches();
        return res.status(200).json({
            success: true,
            message: "Branches fetched successfully",
            data: branches
        });
    } catch (error) {
        next(error);
    }
};