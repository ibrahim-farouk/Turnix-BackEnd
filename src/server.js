import http from "http";
import app from "./app.js";
import { connectMongo, disconnectMongo } from "./db/mongo.js";
import { env, validateConfig } from "./config/env.js";
import { initSocketServer } from "./socket/index.js";

let server;
let io;

// Graceful shutdown handler used to cleanly shutdown the server 
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  try {
    // io.close() automatically closes the attached HTTP server
    if (io) {
      await new Promise((resolve) => io.close(resolve));
    } else if (server) {
      // Fallback if io wasn't initialized yet
      await new Promise((resolve) => server.close(resolve));
    }
    
    await disconnectMongo();
    console.log("Shutdown complete.");
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
};

const boot = async () => {
  validateConfig();
  await connectMongo();

  server = http.createServer(app);
  io = initSocketServer(server);

  server.listen(env.port, () => {
    console.log(`Turnix API: http://localhost:${env.port}`);
  });

  // 1. Graceful Shutdown Signals
  process.on("SIGINT", () => shutdown("SIGINT")); // Ctrl+C
  process.on("SIGTERM", () => shutdown("SIGTERM")); // kill

  // 2. Handle Runtime Unhandled Errors
  process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection! Shutting down...", err);
    shutdown("UNHANDLED_REJECTION");
  });
  
  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception! Shutting down...", err);
    shutdown("UNCAUGHT_EXCEPTION");
  });
};

boot().catch(async (err) => {
  console.error("Failed to start server", err);
  await disconnectMongo().catch(() => {});
  process.exit(1);
});