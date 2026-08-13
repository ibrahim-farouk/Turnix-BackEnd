import {
    countWaitingTickets,
    countServingTickets,
    countCompletedTickets,
    calculateAverageWait
} from "../modules/workspace/workspace.repository.js";

// Africa/Cairo date string, matching the convention used by
// `src/modules/workspace/workspace.service.js` and
// `src/modules/tickets/ticket.service.js`.
const getQueueDate = () =>
    new Intl.DateTimeFormat("en-CA", {
        timeZone: "Africa/Cairo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());

// Compute the four KPI values that `GET /api/workspace` returns under
// `statistics`. Re-uses the same repository aggregates so numbers stay in
// lockstep with REST.
//
// Pure function over the DB — no `io` dependency, so this file is easy to
// unit-test independently of the socket server.
export const getWorkspaceStats = async (branchId, serviceId) => {
    const queueDate = getQueueDate();

    const [waiting, serving, completed, averageWait] = await Promise.all([
        countWaitingTickets(branchId, serviceId, queueDate),
        countServingTickets(branchId, serviceId, queueDate),
        countCompletedTickets(branchId, serviceId, queueDate),
        calculateAverageWait(branchId, serviceId, queueDate)
    ]);

    return {
        waiting,
        serving,
        completed,
        avgWait: Math.round(averageWait)
    };
};
