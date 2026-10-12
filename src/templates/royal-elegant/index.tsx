import type { InvitationContent } from "@/validators/invitation";
import { dateLabel } from "@/lib/utils";
export function RoyalCover({ content: c }: { content: InvitationContent }) {
  return (
    <div className="invite-cover royal">
      <div className="crest">
        <span>
          {c.partner1[0] || "A"}
          {c.partner2[0] || "R"}
        </span>
      </div>
      <p className="mb-8 mt-5">Dengan restu dan cinta</p>
      <h2>
        {c.partner1 || "Nama"}
        <span className="amp">&</span>
        {c.partner2 || "Pasangan"}
      </h2>
      <p className="mt-10">
        {c.events[0]?.startAt
          ? dateLabel(c.events[0].startAt)
          : "Pernikahan kami"}
      </p>
      <p>{c.events[0]?.venue}</p>
    </div>
  );
}
