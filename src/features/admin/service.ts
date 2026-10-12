import { db } from "@/lib/db";
import { secureToken } from "@/lib/security/tokens";
import { Prisma } from "@prisma/client";
import { templateSchema } from "@/validators/template";
import { contentSchema } from "@/validators/invitation";
import { z } from "zod";
import { AppError } from "@/lib/security/errors";
import { serializable } from "@/lib/db/transaction";
export async function saveTemplate(
  actorId: string,
  input: unknown,
  id?: string,
) {
  const data = templateSchema.parse(input);
  return db.$transaction(async (tx) => {
    const existing = id
      ? await tx.template.findUnique({ where: { id } })
      : null;
    if (id && !existing) throw new AppError(404, "Template tidak ditemukan.");
    if (existing && existing.key !== data.key)
      throw new AppError(422, "Kunci renderer template tidak dapat diubah.");
    const record = id
      ? await tx.template.update({ where: { id }, data })
      : await tx.template.create({
          data: {
            ...data,
            version: 1,
            currency: "IDR",
            previewImages: [data.thumbnailUrl],
            configSchema: z.toJSONSchema(
              contentSchema,
            ) as Prisma.InputJsonValue,
          },
        });
    await tx.auditLog.create({
      data: {
        actorId,
        action: id ? "TEMPLATE_UPDATED" : "TEMPLATE_CREATED",
        entityType: "Template",
        entityId: record.id,
        metadata: {
          price: record.price,
          previousPrice: existing?.price,
          isActive: record.isActive,
        },
      },
    });
    return record;
  });
}
export async function updateUser(
  actorId: string,
  id: string,
  data: { role: "USER" | "ADMIN"; disabled: boolean },
) {
  if (id === actorId)
    throw new AppError(
      422,
      "Anda tidak dapat mengubah peran atau menonaktifkan akun sendiri.",
    );
  await serializable(async (tx) => {
    const user = await tx.user.findUnique({ where: { id } });
    if (!user) throw new AppError(404, "Pengguna tidak ditemukan.");
    if (
      user.role === "ADMIN" &&
      (data.role !== "ADMIN" || data.disabled) &&
      (await tx.user.count({ where: { role: "ADMIN", disabledAt: null } })) <= 1
    )
      throw new AppError(409, "Setidaknya satu admin aktif harus tersedia.");
    await tx.user.update({
      where: { id },
      data: {
        role: data.role,
        disabledAt: data.disabled ? new Date() : null,
        sessionVersion: { increment: 1 },
      },
    });
    await tx.auditLog.create({
      data: {
        actorId,
        action: "USER_UPDATED",
        entityType: "User",
        entityId: id,
        metadata: data,
      },
    });
    await tx.emailJob.create({
      data: {
        key: `account-change:${id}:${secureToken()}`,
        to: user.email,
        subject: "Status akun diperbarui",
        text: `Pengelola memperbarui akun Anda. Status: ${data.disabled ? "dinonaktifkan" : "aktif"}. Peran: ${data.role === "ADMIN" ? "admin" : "pengguna"}. Hubungi pengelola jika Anda membutuhkan penjelasan.`,
      },
    });
  });
}
