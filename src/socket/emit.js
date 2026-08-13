import { getIO } from "./io-registry.js";
import { workspaceRoom } from "./rooms.js";
import { getWorkspaceStats } from "./stats.js";

// Low-level safe emit. No-ops when the socket server has not been
// initialised (e.g. unit tests of services).
const safeEmit = (room, event, payload) => {
    const io = getIO();
    if (!io) return;
    io.to(room).emit(event, payload);
};

export const emitToWorkspace = (branchId, serviceId, event, payload) =>
    safeEmit(workspaceRoom(branchId, serviceId), event, payload);

export const emitTicketCreated = (branchId, serviceId, ticketView) =>
    emitToWorkspace(branchId, serviceId, "ticket:created", { ticket: ticketView });

export const emitTicketCalled = (branchId, serviceId, ticketView, previousTicketId) =>
    emitToWorkspace(branchId, serviceId, "ticket:called", {
        ticket: ticketView,
        ...(previousTicketId ? { previousTicketId } : {}) // used to show the previous ticket
    });

export const emitTicketCompleted = (branchId, serviceId, ticketView) =>
    emitToWorkspace(branchId, serviceId, "ticket:completed", { ticket: ticketView });

export const emitTicketSkipped = (branchId, serviceId, ticketView) =>
    emitToWorkspace(branchId, serviceId, "ticket:skipped", { ticket: ticketView });

export const emitTicketCancelled = (branchId, serviceId, ticketView) =>
    emitToWorkspace(branchId, serviceId, "ticket:cancelled", { ticket: ticketView });

export const emitWorkspaceStats = async (branchId, serviceId) => {
    const statistics = await getWorkspaceStats(branchId, serviceId);
    emitToWorkspace(branchId, serviceId, "workspace:stats", { statistics });
};
