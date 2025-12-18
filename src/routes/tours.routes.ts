import { Router } from "express";
import { getTours, getTourDetail } from "../controllers/tours.controller.js";
import { validate } from "../middlewares/validate.js";
import { GetToursQuerySchema, TourIdParamsSchema } from "../schemas/tours.schemas.js";
export const toursRouter = () => {
  const r=Router();
  r.get("/", validate({ query: GetToursQuerySchema }), getTours); // API-01
  r.get("/:tourId", validate({ params: TourIdParamsSchema }), getTourDetail); // API-02
  return r;
};
