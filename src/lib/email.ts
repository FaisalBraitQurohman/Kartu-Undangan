import { Resend } from "resend";
import { AppError } from "@/lib/security/errors";
export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  key?: string,
) {
  if (
    process.env.EMAIL_DELIVERY_ENABLED !== "true" ||
    !process.env.RESEND_API_KEY ||
    !process.env.EMAIL_FROM
  )
    throw new AppError(
      503,
      "Pengiriman email belum dikonfigurasi. Hubungi pengelola.",
    );
  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send(
    {
      from: process.env.EMAIL_FROM,
      to,
      subject: `UndangKita — ${subject}`,
      text: `${text}\n\nSalam hangat,\nUndangKita`,
    },
    key ? { idempotencyKey: key } : undefined,
  );
  if (error)
    throw new AppError(503, "Email belum terkirim. Silakan coba kembali.");
}
