import type { Prisma } from "@prisma/client";
import { serializable } from "@/lib/db/transaction";
import { db } from "@/lib/db";
import { AppError } from "@/lib/security/errors";
import { templateAccess } from "@/features/templates/service";
import {
  defaultContent,
  defaultSettings,
  invitationCreateSchema,
  invitationUpdateSchema,
} from "@/validators/invitation";
export async function ownedInvitation(
  userId: string,
  id: string,
  client: Prisma.TransactionClient = db,
) {
  const invitation = await client.invitation.findFirst({
    where: { id, userId },
  });
  if (!invitation) throw new AppError(404, "Undangan tidak ditemukan.");
  return invitation;
}
export async function createInvitation(userId: string, input: unknown) {
  const data = invitationCreateSchema.parse(input);
  return serializable(async (tx) => {
    const template = await templateAccess(userId, data.templateId, tx);
    if (template.isFree)
      await tx.userTemplate.upsert({
        where: { userId_templateId: { userId, templateId: template.id } },
        create: { userId, templateId: template.id },
        update: {},
      });
    return tx.invitation.create({
      data: {
        ...data,
        userId,
        templateVersion: template.version,
        content: defaultContent,
        settings: defaultSettings,
      },
    });
  });
}
export async function deleteInvitation(userId: string, id: string) {
  await serializable(async (tx) => {
    await ownedInvitation(userId, id, tx);
    if (await tx.media.count({ where: { invitationId: id } }))
      throw new AppError(
        409,
        "Hapus berkas foto dan musik melalui editor sebelum menghapus undangan.",
      );
    await tx.invitation.delete({ where: { id } });
    await tx.auditLog.create({
      data: {
        actorId: userId,
        action: "INVITATION_DELETED",
        entityType: "Invitation",
        entityId: id,
      },
    });
  });
}
export async function updateInvitation(
  userId: string,
  id: string,
  input: unknown,
) {
  const data = invitationUpdateSchema.parse(input);
  if (
    data.status === "PUBLISHED" &&
    (!data.content.partner1 ||
      !data.content.partner2 ||
      !data.content.events.some((e) => e.startAt && e.venue))
  )
    throw new AppError(
      422,
      "Isi nama pasangan, waktu, dan tempat acara sebelum publikasi.",
    );
  return serializable(async (tx) => {
    const existing = await ownedInvitation(userId, id, tx);
    await templateAccess(userId, existing.templateId, tx);
    const media = await tx.media.findMany({
      where: { invitationId: id, deletingAt: null },
      select: { url: true, type: true },
    });
    if (
      data.content.gallery.some(
        (g) => !media.some((m) => m.url === g.url && m.type === "IMAGE"),
      ) ||
      (data.content.musicUrl &&
        !media.some(
          (m) => m.url === data.content.musicUrl && m.type === "AUDIO",
        ))
    )
      throw new AppError(
        422,
        "Gunakan media yang diunggah untuk undangan ini.",
      );
    const { count } = await tx.invitation.updateMany({
      where: { id, userId, revision: data.revision },
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        settings: data.settings,
        status: data.status,
        revision: { increment: 1 },
        publishedAt:
          data.status === "PUBLISHED"
            ? existing.publishedAt || new Date()
            : null,
      },
    });
    if (!count)
      throw new AppError(
        409,
        "Undangan berubah di tab lain. Muat ulang sebelum menyimpan.",
      );
    await tx.event.deleteMany({ where: { invitationId: id } });
    const events = data.content.events.filter((e) => e.startAt);
    if (events.length)
      await tx.event.createMany({
        data: events.map((e, i) => ({
          invitationId: id,
          ...e,
          startAt: new Date(e.startAt),
          endAt: e.endAt ? new Date(e.endAt) : null,
          sortOrder: i,
        })),
      });
    await tx.auditLog.create({
      data: {
        actorId: userId,
        action: `INVITATION_${data.status}`,
        entityType: "Invitation",
        entityId: id,
      },
    });
    return tx.invitation.findUniqueOrThrow({ where: { id } });
  });
}
