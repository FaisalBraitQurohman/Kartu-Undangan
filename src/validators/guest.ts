import { z } from "./locale";
export const guestSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{0,24}$/, "Nomor telepon tidak valid.")
    .transform((value) => {
      const digits = value.replace(/\D/g, "");
      if (!digits) return "";
      return `+${digits.startsWith("0") ? `62${digits.slice(1)}` : !value.startsWith("+") && digits.startsWith("8") ? `62${digits}` : digits}`;
    })
    .refine(
      (value) => !value || /^\+[1-9][0-9]{7,14}$/.test(value),
      "Nomor telepon tidak valid.",
    )
    .optional(),
});
export const rsvpSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/),
  status: z.enum(["ATTENDING", "NOT_ATTENDING", "MAYBE"]),
  attendeeCount: z.number().int().min(0).max(20),
  message: z.string().trim().max(1000).optional(),
  website: z.literal("").optional(),
});
export const wishSchema = z.object({
  token: z
    .string()
    .regex(/^[a-f0-9]{64}$/)
    .optional(),
  name: z.string().trim().min(2).max(100),
  message: z.string().trim().min(2).max(1000),
  website: z.literal("").optional(),
});
