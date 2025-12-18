import pinoHttp from "pino-http";
import pino from "pino";
import { env } from "../config/env.js";
export const httpLogger = () => pinoHttp({ logger: pino({ level: env.LOG_LEVEL }) });
