import type { InvitationContent } from "@/validators/invitation";
import { Flower } from "../ornaments";
import { dateLabel } from "@/lib/utils";
export function BloomCover({ content: c }: { content: InvitationContent }) {
  return (
    <div className="invite-cover bloom">
      <Flower />
      <div className="petal-label">
        <p>Kisah cinta kami</p>
        <p>
          {c.events[0]?.startAt
            ? dateLabel(c.events[0].startAt)
            : "Segera dimulai"}
        </p>
      </div>
      <h2>
        {c.partner1 || "Nama"}
        <br />
        <span className="amp">&</span>
        <br />
        {c.partner2 || "Pasangan"}
      </h2>
      <p className="mt-8 relative z-10">Bersama, selamanya.</p>
    </div>
  );
}
