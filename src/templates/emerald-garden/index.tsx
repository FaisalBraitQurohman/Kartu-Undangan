import type { InvitationContent } from "@/validators/invitation";
import { Botanical } from "../ornaments";
import { dateLabel } from "@/lib/utils";
export function EmeraldCover({ content: c }: { content: InvitationContent }) {
  return (
    <div className="invite-cover emerald">
      <Botanical className="top" />
      <Botanical className="bottom" />
      <p className="mb-10">Di taman, kita bertemu</p>
      <h2>
        {c.partner1 || "Nama"}
        <span className="amp">&</span>
        {c.partner2 || "Pasangan"}
      </h2>
      <div className="my-8 h-px w-12 bg-current" />
      <p>
        {c.events[0]?.startAt
          ? dateLabel(c.events[0].startAt)
          : "Merayakan cinta"}
      </p>
      <p>{c.events[0]?.venue}</p>
    </div>
  );
}
