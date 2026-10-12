import { db } from "@/lib/db";
import { wishSchema } from "@/validators/guest";
import { settingsSchema } from "@/validators/invitation";
import { AppError } from "@/lib/security/errors";
import { publishedGate } from "@/features/invitations/public";
export async function submitWish(slug: string, input: unknown) {
  const data = wishSchema.parse(input);
  const invitation = await publishedGate(slug);
  const settings = settingsSchema.parse(invitation.settings);
  if (!settings.wishesEnabled) throw new AppError(403, "Ucapan dinonaktifkan.");
  const guest = data.token
    ? await db.guest.findFirst({
        where: { token: data.token, invitationId: invitation.id },
      })
    : null;
  if (data.token && !guest) throw new AppError(404, "Tautan tamu tidak valid.");
  await db.wish.create({
    data: {
      invitationId: invitation.id,
      guestId: guest?.id,
      name: guest?.name || data.name,
      message: data.message,
      isApproved: !settings.moderateWishes,
    },
  });
}
