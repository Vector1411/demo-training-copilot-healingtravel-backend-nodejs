import { Router } from "express";
import { health } from "../controllers/health.controller.js";

export const healthRouter = () => {
  const r = Router();
  r.get("/", health);
  return r;
};
