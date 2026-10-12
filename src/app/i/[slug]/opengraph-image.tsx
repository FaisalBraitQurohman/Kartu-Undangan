import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { publishedGate } from "@/features/invitations/public";
import { db } from "@/lib/db";
import { AppError } from "@/lib/security/errors";
import { contentSchema } from "@/validators/invitation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const gate = await publishedGate((await params).slug);
    const record = await db.invitation.findUniqueOrThrow({
      where: { id: gate.id },
      select: { content: true },
    });
    const c = contentSchema.parse(record.content);
    return new ImageResponse(
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#FAF8F4",
          color: "#3B302B",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          border: "22px solid #EDE3D6",
        }}
      >
        <div style={{ display: "flex", fontSize: 24, marginBottom: 35 }}>
          Undangan pernikahan
        </div>
        <div style={{ display: "flex", fontSize: 88, fontFamily: "serif" }}>
          {c.partner1} & {c.partner2}
        </div>
        <div style={{ display: "flex", fontSize: 28, marginTop: 35 }}>
          {c.events[0]?.venue || "Hari istimewa kami"}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 20,
            marginTop: 50,
            color: "#75675c",
          }}
        >
          UndangKita
        </div>
      </div>,
      size,
    );
  } catch (e) {
    if (e instanceof AppError && e.status === 404) notFound();
    throw e;
  }
}
