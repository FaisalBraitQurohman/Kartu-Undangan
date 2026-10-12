import { Resend } from "resend";
import { AppError } from "@/lib/security/errors";
import { mkdir, writeFile } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { resolve } from "node:path";

export function assertEmailConfigured() {
  const local = process.env.EMAIL_TRANSPORT === "local";
  if (
    process.env.EMAIL_DELIVERY_ENABLED !== "true" ||
    (local &&
      (process.env.NODE_ENV === "production" || !!process.env.VERCEL)) ||
    (!local && (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM)) ||
    (process.env.EMAIL_TRANSPORT &&
      !["local", "resend"].includes(process.env.EMAIL_TRANSPORT))
  )
    throw new AppError(
      503,
      "Pengiriman email belum dikonfigurasi. Hubungi pengelola.",
    );
}
export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  key?: string,
) {
  assertEmailConfigured();
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.EMAIL_TRANSPORT === "local"
  ) {
    const directory = resolve(
      /* turbopackIgnore: true */ process.env.LOCAL_MAIL_DIR || ".local/mail",
    );
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const name = key
      ? createHash("sha256").update(key).digest("hex")
      : `${Date.now()}-${randomUUID()}`;
    try {
      await writeFile(
        resolve(directory, `${name}.txt`),
        `EMAIL DEVELOPMENT LOKAL — tidak dikirim ke internet\nKepada: ${to}\nSubjek: UndangKita — ${subject}\n\n${text}\n\nSalam hangat,\nUndangKita\n`,
        { flag: "wx", mode: 0o600 },
      );
    } catch (error) {
      if (!(
        error instanceof Error &&
        "code" in error &&
        error.code === "EEXIST"
      ))
        throw new AppError(
          503,
          "Email lokal belum tersimpan. Periksa akses folder inbox.",
        );
    }
    return;
  }
  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send(
    {
      from: process.env.EMAIL_FROM!,
      to,
      subject: `UndangKita — ${subject}`,
      text: `${text}\n\nSalam hangat,\nUndangKita`,
    },
    key ? { idempotencyKey: key } : undefined,
  );
  if (error)
    throw new AppError(503, "Email belum terkirim. Silakan coba kembali.");
}
