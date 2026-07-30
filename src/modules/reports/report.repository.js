import { Ticket } from "../../models/index.js";

const groupStage = Object.freeze({
    _id: "$queueDate",
    served: {
        $sum: {
            $cond: [
                {
                    $eq: ["$status", "COMPLETED"]
                },
                1,
                0
            ]
        },
    },
    skipped: {
        $sum: {
            $cond: [
                {
                    $eq: ["$status", "SKIPPED"]
                },
                1,
                0
            ]
        },
    },
    averageWaitingTime: {
        $avg: {
            $cond: [
                {
                    $and: [
                        { $ne: ["$calledAt", null] },
                        { $ne: ["$joinedAt", null] }
                    ]
                },
                {
                    $divide: [
                        {
                            $subtract: [
                                "$calledAt",
                                "$joinedAt"
                            ]
                        },
                        1000 * 60
                    ]
                },
                null
            ],
        },
    },
    averageServiceTime: {
        $avg: {
            $cond: [
                {
                    $and: [
                        { $ne: ["$completedAt", null] },
                        { $ne: ["$calledAt", null] }
                    ]
                },
                {
                    $divide: [
                        {
                            $subtract: [
                                "$completedAt",
                                "$calledAt"
                            ]
                        },
                        1000 * 60
                    ]
                },
                null
            ]
        }
    }
});

export const findSummary = async (matchStage) => {
    const [summary] = await Ticket.aggregate([
        { $match: matchStage, },
        {
            $group: {
                _id: null,
                served:
                {
                    $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] }
                },
                skipped: {
                    $sum: { $cond: [{ $eq: ["$status", "SKIPPED"] }, 1, 0] }
                },
                averageWaitingTime: {
                    $avg: { $cond: [{ $and: [{ $ne: ["$calledAt", null] }, { $ne: ["$joinedAt", null] }] }, { $divide: [{ $subtract: ["$calledAt", "$joinedAt"] }, 1000 * 60] }, null], },
                },
                averageServiceTime: {
                    $avg: {
                        $cond: [{
                            $and: [{ $ne: ["$completedAt", null] },
                            {
                                $ne: ["$calledAt", null]
                            }]
                        }, {
                            $divide: [
                                {
                                    $subtract: ["$completedAt", "$calledAt"]
                                }, 1000 * 60]
                        },
                            null
                        ]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                served: 1,
                skipped: 1,
                averageWaitingTime: {
                    $ifNull: [
                        {
                            $round: ["$averageWaitingTime", 0]
                        },
                        0
                    ]
                },
                averageServiceTime: {
                    $ifNull: [
                        {
                            $round: ["$averageServiceTime", 0]
                        },
                        0
                    ]
                }
            }
        }
    ])
    return (
        summary || {
            served: 0,
            skipped: 0,
            averageWaitingTime: 0,
            averageServiceTime: 0,
        }
    );;
}

export const findPerformanceRecords = async ({
    matchStage,
    search,
    page,
    limit,
}) => {
    const pipeline = [ // Aggregation pipeline stages
        {
            $match: matchStage,
        },
        {
            $group: groupStage
        }
    ];
    if (search) {
        pipeline.push({
            $match: {
                _id: {
                    $regex: search,
                    $options: "i"
                }
            }
        })
    }
    pipeline.push(
        {
            $sort: {
                _id: -1,
            }
        },
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: limit,
        },
        {
            $project: {
                _id: 0,
                date: "$_id",
                served: 1,
                skipped: 1,
                averageWaitingTime: {
                    $ifNull: [
                        {
                            $round: ["$averageWaitingTime", 0],
                        },
                        0,
                    ],
                },
                averageServiceTime: {
                    $ifNull: [
                        {
                            $round: ["$averageServiceTime", 0],
                        },
                        0,
                    ],
                },
            }
        }
    );

    return await Ticket.aggregate(pipeline);

}

export const countPerformanceRecords = async ({
    matchStage,
    search,
}) => {
    const pipeline = [
        {
            $match: matchStage,
        },
        {
            $group: {
                _id: "$queueDate",
            },
        },
    ];
    if (search) {
        pipeline.push({
            $match: {
                _id: {
                    $regex: search,
                    $options: "i",
                },
            },
        });
    }
    pipeline.push({
        $count: "total",
    });
    const [result] = await Ticket.aggregate(pipeline);
    return result?.total || 0;
};

export const exportReport = async ({ matchStage, search }) => {
    const pipeline = [
        {
            $match: matchStage,
        },
        {
            $group: groupStage,
        },
    ];
    if (search) {
        pipeline.push({
            $match: {
                _id: {
                    $regex: search,
                    $options: "i",
                },
            },
        });
    }
    pipeline.push(
        {
            $sort: {
                _id: -1,
            },
        },
        {
            $project: {
                _id: 0,
                date: "$_id",
                served: 1,
                skipped: 1,
                averageWaitingTime: {
                    $ifNull: [
                        {
                            $round: ["$averageWaitingTime", 0],
                        },
                        0,
                    ],
                },
                averageServiceTime: {
                    $ifNull: [
                        {
                            $round: ["$averageServiceTime", 0],
                        },
                        0,
                    ],
                },
            },
        }
    );
    return Ticket.aggregate(pipeline);
};