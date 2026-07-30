import {
    findBranchById,
    findServiceByBranch,
    findCurrentServing,
    findWaitingQueue,
    countWaitingTickets,
    countServingTickets,
    countCompletedTickets,
    calculateAverageWait,

    findTicketById,
    findServingTicket,
    callWaitingTicket,
    completeServingTicket,
    skipServingTicket,
    cancelServingTicket
} from "./workspace.repository.js";

import { findSettings } from "../tickets/ticket.repository.js";

import AppError from "../../common/errors/app-error.js";
import {
    ERROR_CODES,
    USER_ROLES
} from "../../common/utils/constants.js";

// Get current date based on Egypt timezone
const getCurrentDate = () => {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Africa/Cairo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());
};

const validateEmployeeWorkspace = (user) => {
    if (user.role !== USER_ROLES.EMPLOYEE) {
        throw new AppError("Only employees can perform workspace actions", 403, ERROR_CODES.FORBIDDEN);
    }
    if (!user.branch || !user.service) {
        throw new AppError("Employee is not assigned to a branch or service", 400, ERROR_CODES.VALIDATION_ERROR);
    }
    if (!user.counterNumber) {
        throw new AppError("Employee is not assigned to a counter", 400, ERROR_CODES.VALIDATION_ERROR);
    }

    return {
        branchId: user.branch.toString(),
        serviceId: user.service.toString(),
        employeeId: user._id.toString(),
        counterNumber: user.counterNumber
    }
}

export const getWorkspace = async (user, filters = {}) => {
    let branchId;
    let serviceId;

    // 1. Determine workspace based on user role
    if (user.role === USER_ROLES.EMPLOYEE) {
        if (!user.branch || !user.service) {
            throw new AppError("Employee is not assigned to a branch or service", 400, ERROR_CODES.VALIDATION_ERROR);
        }
        branchId = user.branch.toString();
        serviceId = user.service.toString();

    } else if (user.role === USER_ROLES.ADMIN) {
        if (!filters.branchId || !filters.serviceId) {
            throw new AppError("Branch and service are required", 400, ERROR_CODES.VALIDATION_ERROR);
        }
        branchId = filters.branchId.toString();
        serviceId = filters.serviceId.toString();

    } else {
        throw new AppError("Access denied", 403, ERROR_CODES.FORBIDDEN);
    }

    // validate branch
    const branch = await findBranchById(branchId);

    if (!branch) {
        throw new AppError("Branch Not Found", 404, ERROR_CODES.NOT_FOUND)
    };

    // validate service
    const service = await findServiceByBranch(serviceId, branchId);

    if (!service) {
        throw new AppError("Service Not Found For This Branch", 404, ERROR_CODES.NOT_FOUND)
    };

    const queueDate = getCurrentDate();

    const [
        currentServing,
        waitingQueue,
        waiting,
        serving,
        completed,
        averageWait,
        settings
    ] = await Promise.all([
        findCurrentServing(branchId, serviceId, queueDate),
        findWaitingQueue(branchId, serviceId, queueDate),
        countWaitingTickets(branchId, serviceId, queueDate),
        countServingTickets(branchId, serviceId, queueDate),
        countCompletedTickets(branchId, serviceId, queueDate),
        calculateAverageWait(branchId, serviceId, queueDate),
        findSettings()
    ]);

    // Default service time
    const defaultServiceTime = settings?.defaultServiceTime ?? 15;

    const formattedWaitingQueue = waitingQueue.map((ticket, index) => {
        const queuePosition = currentServing ? index + 2 : index + 1;
        const peopleAhead = currentServing ? index + 1 : index;
        const estimatedWait = peopleAhead * defaultServiceTime;
        return {
            id: ticket._id.toString(),
            ticketNumber: ticket.ticketNumber,
            customerName: ticket.customerName,
            customerPhone: ticket.customerPhone,
            status: ticket.status,
            service: {
                id: service._id.toString(),
                name: service.name
            },
            queuePosition,
            peopleAhead,
            estimatedWait,
            joinedAt: ticket.joinedAt
        }
    });

    const formattedCurrentServing = currentServing ? {
        id: currentServing._id.toString(),
        ticketNumber: currentServing.ticketNumber,
        customerName: currentServing.customerName,
        customerPhone: currentServing.customerPhone,
        counterNumber: currentServing.counterNumber ?? null,
        calledAt: currentServing.calledAt ?? null,
        status: currentServing.status,
        service: {
            id: service._id.toString(),
            name: service.name
        },
        joinedAt: currentServing.joinedAt
    } : null;
    return {
        branch: {
            id: branch._id.toString(),
            name: branch.name
        },
        service: {
            id: service._id.toString(),
            name: service.name
        },
        statistics: {
            waiting,
            serving,
            completed,
            avgWait: Math.round(averageWait) // calledAt - joinedAt
        },
        currentServing: formattedCurrentServing,
        waitingQueue: formattedWaitingQueue,
    };
}

export const callCustomer = async (
    user,
    ticketId
) => {
    const {
        branchId,
        serviceId,
        employeeId,
        counterNumber,
    } = validateEmployeeWorkspace(user);

    const queueDate = getCurrentDate();

    const ticket = await findTicketById(
        ticketId,
        branchId,
        serviceId,
        queueDate
    );

    if (!ticket) {
        throw new AppError("Ticket Not Found", 404, ERROR_CODES.NOT_FOUND)
    };

    if (ticket.status !== "WAITING") {
        throw new AppError("Only waiting tickets can be called", 409, ERROR_CODES.CONFLICT)
    };

    const currentServing = await findServingTicket(
        branchId,
        serviceId,
        queueDate
    );

    if (currentServing) {
        throw new AppError("There is already a serving ticket", 409, ERROR_CODES.CONFLICT)
    };

    let updatedTicket;

    try {
        updatedTicket = await callWaitingTicket(
            ticketId,
            employeeId,
            counterNumber
        );
    } catch (error) {
        if (error?.code === 11000) {
            throw new AppError("Another ticket is currently being served", 409, ERROR_CODES.CONFLICT)
        }
        throw error ;
    }

    if (!updatedTicket) {
        throw new AppError("Ticket could not be called", 409, ERROR_CODES.CONFLICT)
    };

    return {
        id: updatedTicket._id.toString(),
        ticketNumber: updatedTicket.ticketNumber,
        status: updatedTicket.status,
        counterNumber: updatedTicket.counterNumber,
        calledAt: updatedTicket.calledAt
    }
}

export const completeService = async (
    user,
    ticketId
) => {
    const {
        branchId,
        serviceId,
        employeeId
    } = validateEmployeeWorkspace(user);

    const queueDate = getCurrentDate();

    const ticket = await findTicketById(
        ticketId,
        branchId,
        serviceId,
        queueDate
    );

    if (!ticket) {
        throw new AppError(
            "Ticket not found in your workspace",
            404,
            ERROR_CODES.NOT_FOUND
        );
    }

    if (ticket.status !== "SERVING") {
        throw new AppError(
            "Only serving tickets can be completed",
            409,
            ERROR_CODES.CONFLICT
        );
    }

    const updatedTicket = await completeServingTicket(
        ticketId,
        employeeId
    );

    if (!updatedTicket) {
        throw new AppError(
            "You cannot complete this ticket",
            403,
            ERROR_CODES.FORBIDDEN
        );
    }


    return {
        id: updatedTicket._id.toString(),
        ticketNumber: updatedTicket.ticketNumber,
        status: updatedTicket.status,
        completedAt: updatedTicket.completedAt
    };
};

export const skipCustomer = async (
    user,
    ticketId
) => {
    const {
        branchId,
        serviceId,
        employeeId
    } = validateEmployeeWorkspace(user);

    const queueDate = getCurrentDate();

    const ticket = await findTicketById(
        ticketId,
        branchId,
        serviceId,
        queueDate
    );

    if (!ticket) {
        throw new AppError(
            "Ticket not found in your workspace",
            404,
            ERROR_CODES.NOT_FOUND
        );
    }

    if (ticket.status !== "SERVING") {
        throw new AppError(
            "Only serving tickets can be skipped",
            409,
            ERROR_CODES.CONFLICT
        );
    }

    const updatedTicket = await skipServingTicket(
        ticketId,
        employeeId
    );

    if (!updatedTicket) {
        throw new AppError(
            "You cannot skip this ticket",
            403,
            ERROR_CODES.FORBIDDEN
        );
    }

    return {
        id: updatedTicket._id.toString(),
        ticketNumber: updatedTicket.ticketNumber,
        status: updatedTicket.status
    }
}

export const cancelService = async (
    user,
    ticketId
) => {
    const {
        branchId,
        serviceId,
        employeeId
    } = validateEmployeeWorkspace(user);

    const queueDate = getCurrentDate();

    const ticket = await findTicketById(
        ticketId,
        branchId,
        serviceId,
        queueDate
    );

    if (!ticket) {
        throw new AppError(
            "Ticket not found in your workspace",
            404,
            ERROR_CODES.NOT_FOUND
        );
    }

    if (ticket.status !== "SERVING") {
        throw new AppError(
            "Only serving tickets can be cancelled",
            409,
            ERROR_CODES.CONFLICT
        );
    }

    const updatedTicket = await cancelServingTicket(
        ticketId,
        employeeId
    );

    if (!updatedTicket) {
        throw new AppError(
            "You cannot cancel this ticket",
            403,
            ERROR_CODES.FORBIDDEN
        );
    }

    return {
        id: updatedTicket._id.toString(),
        ticketNumber: updatedTicket.ticketNumber,
        status: updatedTicket.status
    }
}