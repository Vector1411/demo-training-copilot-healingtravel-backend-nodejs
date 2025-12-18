import { z } from "zod";
export const TourStatusEnum = z.enum(["draft","open","closed"]);

export const GetToursQuerySchema = z.object({ status: z.string().optional() });

export const TourIdParamsSchema = z.object({ tourId: z.string().min(1) });

export const AdminCreateTourBodySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  itinerary: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  price: z.number().optional(),
  status: TourStatusEnum,
  images: z.array(z.string()).optional()
});

export const AdminUpdateTourBodySchema = AdminCreateTourBodySchema.partial();
