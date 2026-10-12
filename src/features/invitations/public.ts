import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { AppError } from "@/lib/security/errors";
export async function publishedGate(
  slug: string,
  client: Prisma.TransactionClient = db,
) {
  const invitation = await client.invitation.findFirst({
    where: { slug, status: "PUBLISHED", user: { disabledAt: null } },
    select: {
      id: true,
      userId: true,
      templateId: true,
      templateVersion: true,
      settings: true,
      template: {
        select: { key: true, version: true, isFree: true, thumbnailUrl: true },
      },
    },
  });
  if (!invitation) throw new AppError(404, "Undangan tidak ditemukan.");
  if (
    !invitation.template.isFree &&
    !(await client.userTemplate.findUnique({
      where: {
        userId_templateId: {
          userId: invitation.userId,
          templateId: invitation.templateId,
        },
      },
    }))
  )
    throw new AppError(404, "Undangan tidak ditemukan.");
  return invitation;
}
