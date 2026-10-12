import { serializable } from "@/lib/db/transaction";
import { rsvpSchema } from "@/validators/guest";
import { settingsSchema } from "@/validators/invitation";
import { AppError } from "@/lib/security/errors";
import { publishedGate } from "@/features/invitations/public";
export async function submitRsvp(slug: string, input: unknown) {
  const data = rsvpSchema.parse(input);
  return serializable(async (tx) => {
    const invitation = await publishedGate(slug, tx);
    const guest = await tx.guest.findFirst({
      where: { token: data.token, invitationId: invitation.id },
      include: { rsvp: true },
    });
    if (!guest) throw new AppError(404, "Tautan tamu tidak valid.");
    const settings = settingsSchema.parse(invitation.settings);
    if (!settings.rsvpEnabled) throw new AppError(403, "RSVP dinonaktifkan.");
    if (guest.rsvp && !settings.allowRsvpUpdate)
      throw new AppError(409, "RSVP sudah tersimpan dan tidak dapat diubah.");
    const count = data.status === "NOT_ATTENDING" ? 0 : data.attendeeCount;
    if (
      data.status !== "NOT_ATTENDING" &&
      (count < 1 || count > settings.maxAttendees)
    )
      throw new AppError(422, `Jumlah tamu harus 1–${settings.maxAttendees}.`);
    return tx.rSVP.upsert({
      where: { guestId: guest.id },
      create: {
        guestId: guest.id,
        status: data.status,
        attendeeCount: count,
        message: data.message,
      },
      update: {
        status: data.status,
        attendeeCount: count,
        message: data.message,
      },
    });
  });
}
