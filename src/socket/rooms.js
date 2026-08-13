// Room naming and join helpers.
//
// Single source of truth for the workspace room format. Used by both the
// `connection` listener (joins) and the emit helpers (targets).
//
// A user without a branch or service assignment joins NO room and therefore
// receives NO events — this is intentional and matches the auth model
// (every active user can connect, but only those with a workspace assignment
// are addressable).
export const workspaceRoom = (branchId, serviceId) =>
    `branch:${branchId}:service:${serviceId}`;

export const joinWorkspace = (socket, branchId, serviceId) => {
    if (!branchId || !serviceId) return;
    socket.join(workspaceRoom(branchId, serviceId)); 
};
