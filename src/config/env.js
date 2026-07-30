import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";

export const env = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "10h",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",

  appUrl: process.env.APP_URL,

  seedAdminEmail: process.env.SEED_ADMIN_EMAIL,
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD,
  seedEmployeeEmail: process.env.SEED_EMPLOYEE_EMAIL,
  seedEmployeePassword: process.env.SEED_EMPLOYEE_PASSWORD
};

export const validateConfig = () => {
  if (!env.mongoUri) {
    throw new Error("MONGO_URI is required");
  }

  if (env.isProduction && (!env.jwtSecret || env.jwtSecret === "dev-secret")) {
    throw new Error("JWT_SECRET must be set to a strong value in production");
  }
};
