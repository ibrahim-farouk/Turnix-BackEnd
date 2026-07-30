import { Ticket, Branch, Service, Setting } from "../../models/index.js";

export const findActiveBranchById = async (branchId) => {
    return await Branch.findOne({
        _id: branchId,
        isActive: true
    }).lean();
};

export const findActiveServiceByBranch = async (serviceId, branchId) => {
    return await Service.findOne({
        _id: serviceId,
        branch: branchId,
        isActive: true
    }).lean();
};

export const findSettings = async () => {
    return await Setting.findOne().lean();
};

export const incrementServiceTicketNumber = async (serviceId, currentDate) => {
    return Service.findByIdAndUpdate(
        { _id: serviceId },
        [
            {
                $set: {
                    lastTicketNumber: {
                        $cond: [
                            {
                                $eq: [
                                    "$lastTicketDate",
                                    currentDate
                                ]
                            },
                            {
                                $add: [
                                    "$lastTicketNumber",
                                    1
                                ]
                            },
                            101
                        ]
                    },
                    lastTicketDate: currentDate
                }
            }
        ],
        {
            new: true
        }
    ).lean();
};

export const createTicket = async (ticket) => {
    return await Ticket.create(ticket);
};

export const countTicketsAhead = async (branchId, serviceId, joinedAt, queueDate) => {
    return await Ticket.countDocuments({
        branch: branchId,
        service: serviceId,
        queueDate,
        status: {
            $in: ["WAITING", "SERVING"]
        },
        joinedAt: {
            $lt: joinedAt
        }
    });
};

// Find ticket for tracking 
export const findTicketForTracking = async (ticketId) => {
    return await Ticket.findById(ticketId)
        .select("+guestTokenHash")
        .populate("branch", "name")
        .populate("service", "name")
        .lean();
}

export const findCurrentServing = async (branchId, serviceId, queueDate) => {
    return await Ticket.findOne({
        branch: branchId,
        service: serviceId,
        queueDate,
        status: "SERVING"
    })
        .select("ticketNumber counterNumber")
        .lean();
}

