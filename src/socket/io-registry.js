// Singleton holder for the Socket.IO server instance.
//
// Services do NOT import `io` directly. They import helpers from `./emit.js`,
// which call `getIO()` here. This keeps the socket server optional in tests
// (getIO() returns null when not initialised) and avoids cross-module coupling.

let io = null;

// For testing purposes
export const setIO = (instance) => {
    io = instance;
};

// For testing purposes
export const getIO = () => io;
