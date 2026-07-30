import { Ticket, Branch, Service } from "../../models/index.js";
import mongoose from "mongoose";

export const findBranchById = async (branchId) => {
    return Branch.findOne({
        _id: branchId,
        isActive: true
    }).lean();
};

export const findServiceByBranch = async (
    serviceId,
    branchId
) => {
    return Service.findOne({
        _id: serviceId,
        branch: branchId,
        isActive: true
    }).lean();
};

export const findCurrentServing = async (
    branchId,
    serviceId,
    queueDate
) => {
    return Ticket.findOne({
        branch: branchId,
        service: serviceId,
        queueDate,
        status: "SERVING"
    })
        .sort({ calledAt: 1 })
        .lean();
};

export const findWaitingQueue = async (
    branchId,
    serviceId,
    queueDate
) => {
    return Ticket.find({
        branch: branchId,
        service: serviceId,
        queueDate,
        status: "WAITING"
    })
        .sort({
            joinedAt: 1
        })
        .lean();
};

export const countWaitingTickets = async (
    branchId,
    serviceId,
    queueDate
) => {
    return Ticket.countDocuments({
        branch: branchId,
        service: serviceId,
        queueDate,
        status: "WAITING"
    });
};

export const countServingTickets = async (
    branchId,
    serviceId,
    queueDate
) => {
    return Ticket.countDocuments({
        branch: branchId,
        service: serviceId,
        queueDate,
        status: "SERVING"
    });
};

export const countCompletedTickets = async (
    branchId,
    serviceId,
    queueDate
) => {
    return Ticket.countDocuments({
        branch: branchId,
        service: serviceId,
        queueDate,
        status: "COMPLETED"
    });
};

export const calculateAverageWait = async (
    branchId,
    serviceId,
    queueDate
) => {
    const result = await Ticket.aggregate([
        {
            $match: {
                branch: new mongoose.Types.ObjectId(branchId),
                service: new mongoose.Types.ObjectId(serviceId),
                queueDate,
                calledAt: {
                    $ne: null
                }
            }
        },
        {
            $project: {
                waitTime: {
                    $divide: [
                        {
                            $subtract: [
                                "$calledAt",
                                "$joinedAt"
                            ]
                        },
                        1000 * 60
                    ]
                }
            },
        },
        {
            $group: {
                _id: null,
                averageWait: {
                    $avg: "$waitTime",
                }
            }
        }
    ]);

    return result[0]?.averageWait ?? 0;
}

export const findTicketById = async (
    ticketId, branchId, serviceId, queueDate
) => {
    return Ticket.findOne({
        _id: ticketId,
        branch: branchId,
        service: serviceId,
        queueDate
    })
};

export const findServingTicket = async (
    branchId,
    serviceId,
    queueDate
) => {
    return Ticket.findOne({
        branch: branchId,
        service: serviceId,
        queueDate,
        status: "SERVING"
    });
}

export const callWaitingTicket = async (
    ticketId,
    employeeId,
    counterNumber
) => {
    return Ticket.findOneAndUpdate(
        {
            _id: ticketId,
            status: "WAITING"
        },
        {
            $set: { // update
                status: "SERVING",
                calledBy: employeeId,
                counterNumber,
                calledAt: Date.now()
            }
        },
        {
            new: true // return the updated document
        }
    ).lean();
};

export const completeServingTicket  = async (
    ticketId,
    employeeId
) => {
    return Ticket.findOneAndUpdate(
        {
            _id: ticketId,
            status: "SERVING",
            calledBy: employeeId
        },
        {
            $set: { // update
                status: "COMPLETED",
                completedAt: Date.now()
            }
        },
        {
            new: true // return the updated document
        }
    ).lean();
}

export const skipServingTicket = async (
    ticketId,
    employeeId
) => {
    return Ticket.findOneAndUpdate(
        {
            _id: ticketId,
            status: "SERVING",
            calledBy: employeeId
        },
        {
            $set: { // update
                status: "SKIPPED"
            }
        },
        {
            new: true // return the updated document
        }
    ).lean();
};

export const cancelServingTicket = async (
    ticketId,
    employeeId
) => {
    return Ticket.findOneAndUpdate(
        {
            _id: ticketId,
            status: "SERVING",
            calledBy: employeeId
        },
        {
            $set: { // update
                status: "CANCELLED"
            }
        },
        {
            new: true // return the updated document
        }
    ).lean();
};

