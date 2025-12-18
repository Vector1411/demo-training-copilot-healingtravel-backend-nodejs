import { z } from "zod";
const VN_PHONE_REGEX = /^(0|\+84)(\d{9})$/;

export const CreateRegistrationBodySchema = z.object({
  tourId: z.string().min(1),
  fullName: z.string().min(1),
  phone: z.string().regex(VN_PHONE_REGEX),
  email: z.string().email().optional(),
  note: z.string().max(500).optional()
});

export const AdminRegistrationsQuerySchema = z.object({ tourId: z.string().min(1) });
