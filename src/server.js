import app from "./app.js";
import { connectMongo, disconnectMongo } from "./db/mongo.js";
import { env, validateConfig } from "./config/env.js";

let server;

// Graceful shutdown handler used to cleanly shutdown the server 
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await disconnectMongo();
  process.exit(0);
};

const boot = async () => {
  validateConfig();
  await connectMongo();

  server = app.listen(env.port, () => {
    console.log(`Turnix API: http://localhost:${env.port}`);
  });

  process.on("SIGINT", () => shutdown("SIGINT")); // Ctrl+C
  process.on("SIGTERM", () => shutdown("SIGTERM")); // kill
};

boot().catch(async (err) => {
  console.error("Failed to start server", err);
  await disconnectMongo().catch(() => {});
  process.exit(1);
});
