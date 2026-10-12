import { db } from "@/lib/db";
import { ownedInvitation } from "@/features/invitations/service";
import { guestSchema } from "@/validators/guest";
import { secureToken } from "@/lib/security/tokens";
import { AppError } from "@/lib/security/errors";
export async function createGuest(
  userId: string,
  invitationId: string,
  input: unknown,
) {
  await ownedInvitation(userId, invitationId);
  return db.guest.create({
    data: { ...guestSchema.parse(input), invitationId, token: secureToken() },
  });
}
export async function updateGuest(
  userId: string,
  invitationId: string,
  guestId: string,
  input: unknown,
) {
  await ownedInvitation(userId, invitationId);
  const changed = await db.guest.updateMany({
    where: { id: guestId, invitationId },
    data: guestSchema.parse(input),
  });
  if (!changed.count) throw new AppError(404, "Tamu tidak ditemukan.");
}
export function csvCell(value: string) {
  const safe = /^\s*[=+\-@]|^[\t\r\n]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}
