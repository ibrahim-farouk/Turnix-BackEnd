import * as workspaceService from "./workspace.service.js";

export const getWorkspace = async (req, res, next) => {
    try {
        const workspace = await workspaceService.getWorkspace(req.user, req.query);
        return res.status(200).json({
            success: true,
            message: "Workspace fetched successfully",
            data: workspace
        })
    }catch (err) {
        next(err);
    }
};

export const callCustomer = async(req, res, next) => {
    try {
        const result = await workspaceService.callCustomer(req.user, req.params.ticketId);
        return res.status(200).json({
            success: true,
            message: "Customer called successfully",
            data: {
                ticket: result
            }
        });
    }catch (err) {
        next(err);
    }
}

export const completeService = async(req, res, next) => {
    try {
        const result = await workspaceService.completeService(req.user, req.params.ticketId);
        return res.status(200).json({
            success: true,
            message: "Service completed successfully",
            data: {
                ticket: result
            }
        });
    }catch (err) {
        next(err);
    }
}

export const skipCustomer = async (req, res, next) => {
    try {
        const result = await workspaceService.skipCustomer(req.user, req.params.ticketId);
        return res.status(200).json({
            success: true,
            message: "Customer skipped successfully",
            data: {
                ticket: result
            }
        });
    }catch (err) {
        next(err);
    }
}

export const cancelService = async (req, res, next) => {
    try {
        const result = await workspaceService.cancelService(req.user, req.params.ticketId);
        return res.status(200).json({
            success: true,
            message: "Service cancelled successfully",
            data: {
                ticket: result
            }
        });
    }catch (err) {
        next(err);
    }
}