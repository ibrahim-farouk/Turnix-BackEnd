import mongoose from "mongoose";
import { env } from "../config/env.js";

export const connectMongo = async () => {
  if (!env.mongoUri) {
    throw new Error("MONGO_URI is required");
  }

  mongoose.set("strictQuery", true); // Suppress deprecation warning for strictQuery

  await mongoose.connect(env.mongoUri, {
    maxPoolSize: 10, // Maximum number of connections in the pool
    serverSelectionTimeoutMS: 10000, // Connection timeout
    socketTimeoutMS: 45000 // Socket timeout
  });
};

export const disconnectMongo = async () => {
  await mongoose.disconnect();
};
