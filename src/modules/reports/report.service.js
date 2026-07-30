import * as reportsRepository from "./report.repository.js";

export const getReports = async (req) => {
    const {
        page = 1,
        limit = 10,
        search,
        date,
    } = req.query;

    const matchStage = {};

    if (date) {
        matchStage.queueDate = date;
    }

    const [summary, records, total] = await Promise.all([
        reportsRepository.findSummary(matchStage),

        reportsRepository.findPerformanceRecords({
            matchStage,
            search,
            page: Number(page),
            limit: Number(limit),
        }),

        reportsRepository.countPerformanceRecords({
            matchStage,
            search,
        }),
    ]);

    return {
        summary,
        records,

        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.max(
                1,
                Math.ceil(total / Number(limit))
            ),
        },
    };
};

export const exportReports = async (req) => {
    const { search, date } = req.query;

    const matchStage = {};

    if (date) {
        matchStage.queueDate = date;
    }

    return reportsRepository.exportReport({
        matchStage,
        search,
    });
};

export default {
    getReports,
    exportReports,
};