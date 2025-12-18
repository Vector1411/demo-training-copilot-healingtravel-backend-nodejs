import dotenv from "dotenv";
dotenv.config();

export const env = {
  NODE_ENV: (process.env.NODE_ENV ?? "development") as "development"|"production"|"test",
  PORT: Number(process.env.PORT ?? 3000),
  API_PREFIX: process.env.API_PREFIX ?? "/api/v1",
  CORS_ORIGINS: (process.env.CORS_ORIGINS ?? "").split(",").map(s=>s.trim()).filter(Boolean),
  LOG_LEVEL: process.env.LOG_LEVEL ?? "info",
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_WEB_API_KEY: process.env.FIREBASE_WEB_API_KEY,
  AUTH_MODE: process.env.AUTH_MODE ?? "{{AUTH_MODE}}",
  FIREBASE_SERVICE_ACCOUNT_JSON: process.env.FIREBASE_SERVICE_ACCOUNT_JSON
};
