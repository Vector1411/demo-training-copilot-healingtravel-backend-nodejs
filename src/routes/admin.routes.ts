import { Router } from "express";
import { adminLogin } from "../controllers/admin.controller.js";
import { adminListTours, adminCreateTour, adminUpdateTour, adminDeleteTour } from "../controllers/adminTours.controller.js";
import { adminListRegistrations } from "../controllers/registrations.controller.js";
import { validate } from "../middlewares/validate.js";
import { requireAdmin } from "../middlewares/auth.js";
import { AdminLoginBodySchema } from "../schemas/admin.schemas.js";
import { AdminCreateTourBodySchema, AdminUpdateTourBodySchema, TourIdParamsSchema } from "../schemas/tours.schemas.js";
import { AdminRegistrationsQuerySchema } from "../schemas/registrations.schemas.js";

export const adminRouter = () => {
  const r=Router();
  r.post("/login", validate({ body: AdminLoginBodySchema }), adminLogin); // API-04
  r.use(requireAdmin);
  r.get("/tours", adminListTours); // API-05
  r.post("/tours", validate({ body: AdminCreateTourBodySchema }), adminCreateTour); // API-06
  r.put("/tours/:tourId", validate({ params: TourIdParamsSchema, body: AdminUpdateTourBodySchema }), adminUpdateTour); // API-07
  r.delete("/tours/:tourId", validate({ params: TourIdParamsSchema }), adminDeleteTour); // API-08
  r.get("/registrations", validate({ query: AdminRegistrationsQuerySchema }), adminListRegistrations); // API-09
  return r;
};
