import { Router } from "express";
import { toursRouter } from "./tours.routes.js";
import { registrationsRouter } from "./registrations.routes.js";
import { adminRouter } from "./admin.routes.js";
export const routes = () => {
  const r=Router();
  r.use("/tours", toursRouter());
  r.use("/registrations", registrationsRouter());
  r.use("/admin", adminRouter());
  return r;
};
