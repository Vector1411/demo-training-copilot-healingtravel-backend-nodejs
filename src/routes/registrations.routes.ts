import { Router } from "express";
import { createRegistration } from "../controllers/registrations.controller.js";
import { validate } from "../middlewares/validate.js";
import { CreateRegistrationBodySchema } from "../schemas/registrations.schemas.js";
export const registrationsRouter = () => {
  const r=Router();
  r.post("/", validate({ body: CreateRegistrationBodySchema }), createRegistration); // API-03
  return r;
};
