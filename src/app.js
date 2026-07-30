
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import { randomUUID } from "node:crypto";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "../docs/swagger.js";

import routes from "./routes/index.js";
import { RATE_LIMIT } from "./common/utils/constants.js";
import { env } from "./config/env.js";
import { notFound } from "./common/middleware/not-found.middleware.js";
import { errorHandler } from "./common/middleware/error.middleware.js";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: env.clientOrigin === "*" ? true : env.clientOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id", "X-Guest-Token", "Idempotency-Key"]
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_REQUESTS,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Request ID
app.use((req, res, next) => {
  req.id = req.headers["x-request-id"] || randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
});

// Body parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "src", "uploads"))
);

// MongoDB sanitization
app.use(mongoSanitize());

// Logging
app.use(morgan("combined"));

app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// Routes
app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
