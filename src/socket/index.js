import { Server } from "socket.io";

import { env } from "../config/env.js";
import { socketAuth } from "./socket-auth.middleware.js";
import { joinWorkspace } from "./rooms.js";
import { setIO } from "./io-registry.js";

// Build the Socket.IO server and attach it to the given http.Server.
//
// CORS mirrors the Express CORS config in `src/app.js` (same `env.clientOrigin`,
// `credentials: true`). HTTP CORS methods/headers don't apply to WebSocket.
//
// On `connection`:
//   1. `socketAuth` middleware has already populated `socket.data` (userId, role,
//      branch, service) or rejected the handshake.
//   2. We auto-join the user to their single workspace room.
//
// There are no client-to-server mutating events in the MVP — the `connection`
// listener only joins the room and nothing more.
export const initSocketServer = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: env.clientOrigin === "*" ? true : env.clientOrigin,
            credentials: true
        },
        transports: ["websocket", "polling"]
    });

    io.use(socketAuth); // Middleware

    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`); 
        joinWorkspace(socket, socket.data.branch, socket.data.service);
    });

    setIO(io);
    return io;
};
