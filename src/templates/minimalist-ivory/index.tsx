import type { InvitationContent } from "@/validators/invitation";
import { Botanical } from "../ornaments";
import { dateLabel } from "@/lib/utils";
export function MinimalistCover({
  content: c,
}: {
  content: InvitationContent;
}) {
  return (
    <div className="invite-cover ivory">
      <div className="cover-oval" />
      <Botanical className="top" />
      <Botanical className="bottom" />
      <p className="mb-9">Undangan pernikahan</p>
      <h2>
        {c.partner1 || "Nama"}
        <span className="amp">&</span>
        {c.partner2 || "Pasangan"}
      </h2>
      <p className="mt-9">
        {c.events[0]?.startAt
          ? dateLabel(c.events[0].startAt)
          : "Hari istimewa kami"}
      </p>
      <p className="mt-3">{c.events[0]?.venue}</p>
    </div>
  );
}
