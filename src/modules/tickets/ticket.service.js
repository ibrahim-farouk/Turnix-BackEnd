import { randomBytes, createHash } from "node:crypto";

import {
    findActiveBranchById,
    findActiveServiceByBranch,
    incrementServiceTicketNumber,
    createTicket,
    countTicketsAhead,
    findSettings,
    findTicketForTracking,
    findCurrentServing
} from "./ticket.repository.js";

import AppError from "../../common/errors/app-error.js";
import { ERROR_CODES } from "../../common/utils/constants.js";

// Generate guest token
const generateGuestToken = () => {
    return randomBytes(32).toString("hex")
}

// Hash guest token before storing it in database
const hashGuestToken = (token) => {
    return createHash("sha256").update(token).digest("hex")
}

// Get current date based on Egypt timezone
const getCurrentDate = () => {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Africa/Cairo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());
};

// Join queue
export const joinQueue = async ({
    branchId, serviceId, customerName, customerPhone
}) => {
    // 1. Validate branch
    const branch = await findActiveBranchById(branchId);
    if (!branch) {
        throw new AppError(
            "Branch not found", 404, ERROR_CODES.NOT_FOUND);
    }

    // 2. Validate service
    const service = await findActiveServiceByBranch(serviceId, branchId);
    if (!service) {
        throw new AppError(
            "Service not found for this branch", 404, ERROR_CODES.NOT_FOUND);
    }

    // 3. Generate guest token
    const guestToken = generateGuestToken();
    const guestTokenHash = hashGuestToken(guestToken);

    // 4. Get current date based on Egypt timezone
    const currentDate = getCurrentDate();

    // 4. Generate next ticket number atomically
    const updateService = await incrementServiceTicketNumber(serviceId, currentDate);
    if (!updateService) {
        throw new AppError(
            "Failed to generate ticket number", 500, ERROR_CODES.INTERNAL_SERVER_ERROR
        );
    }

    const ticketNumber = `${service.prefix}${updateService.lastTicketNumber}`;

    // 5. Create ticket
    const ticket = await createTicket({
        branch: branchId,
        service: serviceId,
        ticketNumber,
        customerName,
        customerPhone,
        status: "WAITING",
        guestTokenHash,
        queueDate: currentDate
    });

    // 6. Calculate queue information
    const peopleAhead = await countTicketsAhead(branchId, serviceId, ticket.joinedAt, currentDate);

    // 7. Get default service time
    const settings = await findSettings();
    const defaultServiceTime = settings?.defaultServiceTime ?? 15;

    // 8. Calculate queue position and estimated wait
    const queuePosition = peopleAhead + 1;
    const estimatedWait = peopleAhead * defaultServiceTime;

    // 9. Return ticket
    return {
        ticket: {
            id: ticket._id.toString(),
            ticketNumber: ticket.ticketNumber,
            status: ticket.status,
            queuePosition,
            peopleAhead,
            estimatedWait,
            branch: {
                id: branch._id.toString(),
                name: branch.name
            },
            service: {
                id: service._id.toString(),
                name: service.name
            },
            joinedAt: ticket.joinedAt
        },
        guestToken
    };

}

export const trackTicket = async (ticketId, guestToken) => {
    if (!guestToken) {
        throw new AppError(
            "Guest token is required", 401, ERROR_CODES.UNAUTHORIZED);
    }
    // find ticket
    const ticket = await findTicketForTracking(ticketId);
    if (!ticket) {
        throw new AppError(
            "Ticket not found", 404, ERROR_CODES.NOT_FOUND
        );
    }
    if (ticket.guestTokenHash !== hashGuestToken(guestToken)) {
        throw new AppError(
            "Invalid guest token", 403, ERROR_CODES.FORBIDDEN
        );
    }
    // get settings
    const settings = await findSettings();
    const defaultServiceTime = settings?.defaultServiceTime ?? 15;

    const ticketData = {
        id: ticket._id.toString(),
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        branch: {
            id: ticket.branch._id.toString(),
            name: ticket.branch.name
        },
        service: {
            id: ticket.service._id.toString(),
            name: ticket.service.name
        },
        joinedAt: ticket.joinedAt
    };

    if (
        ticket.status === "COMPLETED" ||
        ticket.status === "SKIPPED" ||
        ticket.status === "CANCELLED"
    ) {
        return {
            ...ticketData,
            queuePosition: null,
            peopleAhead: 0,
            estimatedWait: 0,
            currentServing: null,
            counterNumber: ticket.counterNumber ?? null
        };
    }

    if (ticket.status === "SERVING") {
        return {
            ...ticketData,
            queuePosition: 0,
            peopleAhead: 0,
            estimatedWait: 0,
            currentServing: ticket.ticketNumber,
            counterNumber: ticket.counterNumber ?? null
        };
    }

    if (ticket.status === "WAITING") {
        const peopleAhead = await countTicketsAhead(ticket.branch._id, ticket.service._id, ticket.joinedAt, ticket.queueDate);
        const queuePosition = peopleAhead + 1;
        const estimatedWait = peopleAhead * defaultServiceTime;
        const currentServingTicket = await findCurrentServing(ticket.branch._id, ticket.service._id, ticket.queueDate);
        return {
            ...ticketData,
            queuePosition,
            peopleAhead,
            estimatedWait,
            currentServing: currentServingTicket?.ticketNumber ?? null,
            counterNumber: currentServingTicket?.counterNumber ?? null
        };
    }
};