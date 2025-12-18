import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { httpLogger } from "./middlewares/httpLogger.js";
import { routes } from "./routes/index.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";

export function createApp(){
  const app=express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(express.json({limit:"1mb"}));
  app.use(httpLogger());
  app.use(cors({ origin: env.CORS_ORIGINS.length ? env.CORS_ORIGINS : true, credentials:true }));
  app.use(rateLimit({ windowMs: 60_000, limit: 300, standardHeaders: "draft-7", legacyHeaders: false }));
  app.use(env.API_PREFIX, routes());
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
