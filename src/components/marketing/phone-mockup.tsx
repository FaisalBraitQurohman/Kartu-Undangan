import type { CSSProperties } from "react";
import { TemplateCover } from "@/templates/renderer";
import type { TemplateKey } from "@/templates/registry";
import { demoContent, type InvitationContent } from "@/validators/invitation";
export function PhoneMockup({
  templateKey,
  content = demoContent,
  accent,
  className = "",
}: {
  templateKey: TemplateKey;
  content?: InvitationContent;
  accent?: string;
  className?: string;
}) {
  const selectedAccent = accent || content.accent;
  const rgb = selectedAccent
    .slice(1)
    .match(/.{2}/g)
    ?.map((channel) => parseInt(channel, 16)) || [181, 154, 117];
  const lightAccent = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000 > 155;
  return (
    <div
      className={`marketplace-phone ${className}`}
      style={
        {
          "--preview-accent": selectedAccent,
          "--preview-ink": lightAccent ? "#302a25" : "#ffffff",
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <div className="phone-screen">
        <div className="phone-content">
          <TemplateCover templateKey={templateKey} content={content} />
          <span className="phone-open">Buka undangan</span>
        </div>
        <span className="phone-island" />
        <span className="phone-home" />
      </div>
    </div>
  );
}
