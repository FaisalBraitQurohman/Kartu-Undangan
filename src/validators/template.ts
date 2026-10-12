import { z } from "./locale";
import { templateKeys } from "@/templates/registry";
export const templateSchema = z
  .object({
    key: z.enum(templateKeys),
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/)
      .min(3)
      .max(80),
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().min(10).max(2000),
    category: z.enum(["WEDDING", "ENGAGEMENT", "CELEBRATION"]),
    price: z.number().int().min(0).max(100_000_000),
    isFree: z.boolean(),
    isActive: z.boolean(),
    thumbnailUrl: z
      .string()
      .refine(
        (v) =>
          /^\/previews\/[a-z0-9-]+\.svg$/.test(v) ||
          /^https:\/\/res\.cloudinary\.com\//.test(v),
        "Gunakan thumbnail lokal atau Cloudinary.",
      ),
  })
  .refine(
    (v) => (v.isFree ? v.price === 0 : v.price > 0),
    "Template gratis harus berharga nol; premium harus berharga lebih dari nol.",
  );
