import { db } from "@/lib/db";
import { AppError } from "@/lib/security/errors";
import type { Prisma } from "@prisma/client";
import { rendererSupported } from "@/templates/registry";
export async function templateAccess(
  userId: string,
  templateId: string,
  client: Prisma.TransactionClient = db,
) {
  const template = await client.template.findUnique({
    where: { id: templateId },
  });
  if (!template || !rendererSupported(template.key, template.version))
    throw new AppError(404, "Template tidak tersedia.");
  const owned = await client.userTemplate.findUnique({
    where: { userId_templateId: { userId, templateId } },
  });
  if (!template.isActive && !owned)
    throw new AppError(404, "Template tidak tersedia.");
  if (!template.isFree && !owned)
    throw new AppError(403, "Beli template ini terlebih dahulu.");
  return template;
}
export async function activeTemplates() {
  return db.template.findMany({
    where: { isActive: true },
    orderBy: [{ price: "asc" }, { name: "asc" }],
  });
}
