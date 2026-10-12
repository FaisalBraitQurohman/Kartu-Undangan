import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema, resetSchema } from "@/validators/auth";
import { AppError } from "@/lib/security/errors";
import { secureToken, tokenHash } from "@/lib/security/tokens";
import { sendEmail } from "@/lib/email";
import { appUrl } from "@/lib/utils";
export async function register(input: unknown) {
  const data = registerSchema.parse(input);
  const passwordHash = await hash(data.password, 12);
  const token = secureToken();
  await db.$transaction(async (tx) => {
    if (await tx.user.findUnique({ where: { email: data.email } }))
      throw new AppError(
        409,
        "Email sudah terdaftar. Gunakan login atau lupa kata sandi.",
      );
    await tx.user.create({
      data: { name: data.name, email: data.email, passwordHash },
    });
    await tx.verificationToken.create({
      data: {
        identifier: data.email,
        token: tokenHash(token),
        expires: new Date(Date.now() + 86_400_000),
      },
    });
  });
  await sendEmail(
    data.email,
    "Verifikasi email",
    `Aktifkan akun Anda melalui tautan berikut (berlaku 24 jam):\n${appUrl()}/verify-email?token=${token}`,
  );
}
export async function resendVerification(email: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user || user.emailVerified || user.disabledAt) return;
  const token = secureToken();
  await db.$transaction(async (tx) => {
    await tx.verificationToken.deleteMany({ where: { identifier: email } });
    await tx.verificationToken.create({
      data: {
        identifier: email,
        token: tokenHash(token),
        expires: new Date(Date.now() + 86_400_000),
      },
    });
  });
  await sendEmail(
    email,
    "Verifikasi email",
    `Aktifkan akun Anda:\n${appUrl()}/verify-email?token=${token}`,
  );
}
export async function verifyEmail(token: string) {
  await db.$transaction(async (tx) => {
    const found = await tx.verificationToken.findUnique({
      where: { token: tokenHash(token) },
    });
    if (!found || found.expires <= new Date())
      throw new AppError(400, "Tautan verifikasi tidak berlaku.");
    // Deletion claims the token. A concurrent request cannot consume it twice.
    await tx.verificationToken.delete({ where: { token: found.token } });
    await tx.user.update({
      where: { email: found.identifier },
      data: { emailVerified: new Date() },
    });
  });
}
export async function forgotPassword(email: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user || user.disabledAt) return;
  const token = secureToken();
  await db.$transaction(async (tx) => {
    await tx.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await tx.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: tokenHash(token),
        expiresAt: new Date(Date.now() + 3_600_000),
      },
    });
  });
  await sendEmail(
    email,
    "Atur ulang kata sandi",
    `Tautan berikut berlaku satu jam:\n${appUrl()}/reset-password?token=${token}\nAbaikan jika Anda tidak meminta perubahan ini.`,
  );
}
export async function resetPassword(input: unknown) {
  const { token, password } = resetSchema.parse(input);
  const passwordHash = await hash(password, 12);
  await db.$transaction(async (tx) => {
    const found = await tx.passwordResetToken.findUnique({
      where: { tokenHash: tokenHash(token) },
    });
    if (!found || found.expiresAt <= new Date())
      throw new AppError(400, "Tautan reset tidak berlaku. Minta tautan baru.");
    await tx.passwordResetToken.delete({ where: { id: found.id } });
    await tx.user.update({
      where: { id: found.userId },
      data: { passwordHash, sessionVersion: { increment: 1 } },
    });
    await tx.passwordResetToken.deleteMany({ where: { userId: found.userId } });
    await tx.auditLog.create({
      data: {
        actorId: found.userId,
        action: "PASSWORD_RESET",
        entityType: "User",
        entityId: found.userId,
      },
    });
    const account = await tx.user.findUniqueOrThrow({
      where: { id: found.userId },
      select: { email: true },
    });
    await tx.emailJob.create({
      data: {
        key: `password-reset:${found.id}`,
        to: account.email,
        subject: "Kata sandi diperbarui",
        text: "Kata sandi akun Anda telah diperbarui. Semua sesi sebelumnya telah diakhiri. Jika Anda tidak melakukan perubahan ini, segera hubungi pengelola.",
      },
    });
  });
}
