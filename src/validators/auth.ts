import { z } from "./locale";
export const emailSchema = z
  .email("Alamat email tidak valid.")
  .max(254)
  .transform((v) => v.trim().toLowerCase());
export const passwordSchema = z
  .string()
  .min(12, "Kata sandi minimal 12 karakter.")
  .max(72, "Kata sandi maksimal 72 karakter.")
  .refine(
    (v) => new TextEncoder().encode(v).length <= 72,
    "Kata sandi terlalu panjang.",
  );
export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: emailSchema,
  password: passwordSchema,
});
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(72),
});
export const resetSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/),
  password: passwordSchema,
});
