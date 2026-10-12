import { z } from "zod";
import {
  register,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
} from "@/features/auth/service";
import { emailSchema } from "@/validators/auth";
import { errorResponse } from "@/lib/security/errors";
import { clientIp, readJson, requireSameOrigin } from "@/lib/security/request";
import { rateLimit } from "@/lib/security/rate-limit";
import { sendEmail } from "@/lib/email";
import { AppError } from "@/lib/security/errors";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ action: string }> },
) {
  try {
    requireSameOrigin(request);
    const { action } = await params;
    await rateLimit(`access:${action}:${clientIp(request)}`, 5);
    const input = await readJson(request);
    if (action === "contact") {
      const data = z
        .object({
          name: z.string().trim().min(2).max(100),
          email: emailSchema,
          message: z.string().trim().min(10).max(3000),
          website: z.literal("").optional(),
        })
        .parse(input);
      if (!process.env.SUPPORT_EMAIL)
        throw new AppError(
          503,
          "Saluran bantuan belum tersedia. Silakan coba lagi nanti.",
        );
      await sendEmail(
        process.env.SUPPORT_EMAIL,
        "Pesan bantuan",
        `${data.name} (${data.email})\n\n${data.message}`,
      );
    } else if (action === "register") await register(input);
    else if (action === "reset") await resetPassword(input);
    else if (action === "verify")
      await verifyEmail(
        z.object({ token: z.string().regex(/^[a-f0-9]{64}$/) }).parse(input)
          .token,
      );
    else if (action === "forgot" || action === "resend") {
      const { email } = z.object({ email: emailSchema }).parse(input);
      await rateLimit(`email:${action}:${email}`, 3);
      // Do not reveal whether an account exists via delivery errors.
      try {
        if (action === "forgot") await forgotPassword(email);
        else await resendVerification(email);
      } catch {
        /* Delivery is retryable via this endpoint. */
      }
    } else
      return Response.json({ error: "Rute tidak ditemukan." }, { status: 404 });
    return Response.json({
      message:
        action === "register"
          ? "Akun dibuat. Periksa email untuk verifikasi."
          : action === "forgot" || action === "resend"
            ? "Jika email terdaftar, tautan akan dikirim. Periksa kotak masuk."
            : "Perubahan berhasil disimpan.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
