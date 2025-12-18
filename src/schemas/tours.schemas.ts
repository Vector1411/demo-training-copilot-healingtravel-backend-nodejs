import { z } from "zod";
export const TourStatusEnum = z.enum(["draft","open","closed"]);

export const GetToursQuerySchema = z.object({
  status: TourStatusEnum.optional(),
  q: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional()
}).refine(v => {
  if (v.minPrice != null && v.maxPrice != null && v.minPrice > v.maxPrice) return false;
  return true;
}, { path: ["minPrice"], message: "minPrice must be <= maxPrice" });

export const TourIdParamsSchema = z.object({ tourId: z.string().min(1) });

const TourContentSchema = z.object({
  introduction: z.string().min(1),
  schedule: z.string().min(1),
  activities: z.string().min(1),
  suitableFor: z.string().min(1),
  notes: z.string().min(1)
});

export const AdminCreateTourBodySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  itinerary: z.string().min(1),
  location: z.string().min(1),
  duration: z.string().min(1),
  content: TourContentSchema,
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  price: z.number().optional(),
  status: TourStatusEnum,
  images: z.array(z.string()).optional()
});

export const AdminUpdateTourBodySchema = AdminCreateTourBodySchema.partial();
