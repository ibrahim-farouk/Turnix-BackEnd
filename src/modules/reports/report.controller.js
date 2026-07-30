import {
    getReports,
    exportReports,
} from "./report.service.js";

import { API_RESPONSE } from "../../common/utils/constants.js";

export const getReportsController = async (req, res, next) => {
    try {
        const reports = await getReports(req);

        res.status(200).json({
            status: API_RESPONSE.SUCCESS,
            data: reports,
        });
    } catch (error) {
        next(error);
    }
};

export const exportReportsController = async (req, res, next) => {
    try {
        const reports = await exportReports(req);

        res.status(200).json({
            status: API_RESPONSE.SUCCESS,
            data: reports,
        });
    } catch (error) {
        next(error);
    }
};