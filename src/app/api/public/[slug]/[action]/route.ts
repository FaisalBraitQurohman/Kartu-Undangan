import { submitRsvp } from "@/features/rsvp/service";
import { submitWish } from "@/features/wishes/service";
import { errorResponse } from "@/lib/security/errors";
import { clientIp, readJson, requireSameOrigin } from "@/lib/security/request";
import { rateLimit } from "@/lib/security/rate-limit";
import { db } from "@/lib/db";
import { publishedGate } from "@/features/invitations/public";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; action: string }> },
) {
  try {
    requireSameOrigin(request);
    const { slug, action } = await params;
    await rateLimit(`public:${slug}:${clientIp(request)}`, 10);
    if (action === "rsvp") await submitRsvp(slug, await readJson(request));
    else if (action === "wishes")
      await submitWish(slug, await readJson(request));
    else if (action === "visit") {
      const invitation = await publishedGate(slug);
      await db.invitationVisit.create({
        data: { invitationId: invitation.id },
      });
    } else
      return Response.json({ error: "Rute tidak ditemukan." }, { status: 404 });
    return Response.json({
      message: "Terima kasih! Jawaban Anda sudah tersimpan.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
