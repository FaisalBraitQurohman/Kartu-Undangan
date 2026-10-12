import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import { db } from "@/lib/db";
import { contentSchema, settingsSchema } from "@/validators/invitation";
import { isTemplateKey, rendererSupported } from "@/templates/registry";
import { InvitationExperience } from "@/components/invitations/experience";
import { unstable_cache } from "next/cache";
import { publishedGate } from "@/features/invitations/public";
import { AppError } from "@/lib/security/errors";
export const dynamic = "force-dynamic";
export const revalidate = 0;
const publicInvitation = cache(async (slug: string) => {
  try {
    // Recheck publication and ownership on every request; never cache this gate.
    const gate = await publishedGate(slug);
    if (!rendererSupported(gate.template.key, gate.templateVersion)) notFound();
    const content = await unstable_cache(
      () =>
        db.invitation.findUniqueOrThrow({
          where: { id: gate.id },
          select: { title: true, slug: true, content: true },
        }),
      ["invitation-content", gate.id],
      { tags: [`invitation:${gate.id}`], revalidate: 3600 },
    )();
    return { ...content, ...gate };
  } catch (error) {
    if (error instanceof AppError && error.status === 404) notFound();
    throw error;
  }
});
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const invitation = await publicInvitation((await params).slug);
  const content = contentSchema.parse(invitation.content);
  return {
    title: invitation.title,
    description: `Undangan ${content.partner1} & ${content.partner2}. ${content.greeting}`,
    robots: { index: false, follow: false },
    openGraph: {
      title: invitation.title,
      description: content.greeting,
      url: `/i/${invitation.slug}`,
      images: [`/i/${invitation.slug}/opengraph-image`],
    },
  };
}
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string }>;
}) {
  const { slug } = await params;
  const { to } = await searchParams;
  if (to && !/^[a-f0-9]{64}$/.test(to)) notFound();
  const invitation = await publicInvitation(slug);
  if (!isTemplateKey(invitation.template.key)) notFound();
  const guest = to
    ? await db.guest.findFirst({
        where: { invitationId: invitation.id, token: to },
        select: {
          name: true,
          rsvp: {
            select: { status: true, attendeeCount: true, message: true },
          },
        },
      })
    : null;
  if (to && !guest) notFound();
  const wishes = await db.wish.findMany({
    where: { invitationId: invitation.id, isApproved: true },
    select: { id: true, name: true, message: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  return (
    <InvitationExperience
      slug={slug}
      templateKey={invitation.template.key}
      content={contentSchema.parse(invitation.content)}
      settings={settingsSchema.parse(invitation.settings)}
      guest={guest?.name}
      token={to}
      rsvp={guest?.rsvp}
      wishes={wishes}
    />
  );
}
