import Image from "next/image";
import type { InvitationContent } from "@/validators/invitation";
import type { TemplateKey } from "./registry";
import { MinimalistCover } from "./minimalist-ivory";
import { RoyalCover } from "./royal-elegant";
import { BloomCover } from "./romantic-bloom";
import { EmeraldCover } from "./emerald-garden";
import { dateLabel } from "@/lib/utils";
import { Countdown } from "@/components/invitations/countdown";
import { MapPin } from "lucide-react";
const covers = {
  "minimalist-ivory": MinimalistCover,
  "royal-elegant": RoyalCover,
  "romantic-bloom": BloomCover,
  "emerald-garden": EmeraldCover,
};
const themes = {
  "minimalist-ivory": "ivory",
  "royal-elegant": "royal",
  "romantic-bloom": "bloom",
  "emerald-garden": "emerald",
};
export function TemplateCover({
  templateKey,
  content,
}: {
  templateKey: TemplateKey;
  content: InvitationContent;
}) {
  const Cover = covers[templateKey];
  return <Cover content={content} />;
}
export function TemplateRenderer({
  templateKey,
  content: c,
  children,
}: {
  templateKey: TemplateKey;
  content: InvitationContent;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="invitation-page @container"
      style={{ "--ring": c.accent } as React.CSSProperties}
    >
      <TemplateCover templateKey={templateKey} content={c} />
      <div className={`invitation-content ${themes[templateKey]}`}>
        <section className="invitation-section">
          <p className="mx-auto max-w-lg text-sm leading-8">{c.greeting}</p>
          <div className="my-9 grid gap-8 @min-[600px]:grid-cols-2">
            {[
              [c.partner1Full || c.partner1, c.family1],
              [c.partner2Full || c.partner2, c.family2],
            ].map(([name, family], i) => (
              <div key={i}>
                <h2>{name || "Nama mempelai"}</h2>
                <p className="text-sm leading-7">{family}</p>
              </div>
            ))}
          </div>
          <blockquote className="mx-auto max-w-lg font-serif text-xl italic leading-8">
            {c.quote}
          </blockquote>
        </section>
        {c.events[0]?.startAt && (
          <section className="invitation-section">
            <h2>Menuju hari bahagia</h2>
            <Countdown date={c.events[0].startAt} />
          </section>
        )}
        <section className="invitation-section">
          <h2>Temui kami di sini</h2>
          <div className="grid gap-6 @min-[600px]:grid-cols-2">
            {c.events.map((e, i) => (
              <article
                key={i}
                className="rounded-2xl border border-current/15 p-7"
              >
                <h3 className="font-serif text-2xl">{e.title}</h3>
                <p className="mt-5 text-sm">
                  {e.startAt ? dateLabel(e.startAt) : "Tanggal belum diisi"}
                </p>
                <p className="my-3 text-sm">
                  {e.startAt &&
                    new Intl.DateTimeFormat("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Jakarta",
                      timeZoneName: "short",
                    }).format(new Date(e.startAt))}
                </p>
                <p className="font-semibold">{e.venue}</p>
                <p className="mt-2 text-sm leading-7">{e.address}</p>
                <p className="text-sm leading-7">{e.description}</p>
                {e.address && (
                  <a
                    className="mt-5 inline-flex items-center gap-2 text-sm underline underline-offset-4"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.latitude !== null && e.longitude !== null ? `${e.latitude},${e.longitude}` : e.address)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MapPin size={16} />
                    Buka peta
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>
        {c.story.length > 0 && (
          <section className="invitation-section">
            <h2>Cerita kami</h2>
            <div className="mx-auto max-w-lg space-y-10">
              {c.story.map((s, i) => (
                <article key={i}>
                  <p className="text-xs text-muted-foreground">{s.date}</p>
                  <h3 className="my-3 font-serif text-2xl">{s.title}</h3>
                  <p className="text-sm leading-8">{s.description}</p>
                </article>
              ))}
            </div>
          </section>
        )}
        {c.gallery.length > 0 && (
          <section className="invitation-section">
            <h2>Potongan kenangan</h2>
            <div className="grid grid-cols-2 gap-3">
              {c.gallery.map((g, i) => (
                <figure key={g.url}>
                  <Image
                    src={g.url}
                    alt={g.caption || `Kenangan pasangan ${i + 1}`}
                    width={600}
                    height={750}
                    sizes="(max-width: 600px) 50vw, 400px"
                    className="aspect-[4/5] w-full rounded-xl object-cover"
                  />
                  <figcaption className="mt-2 text-xs">{g.caption}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}
        {children}
        <section className="invitation-section">
          <p className="mx-auto max-w-lg font-serif text-xl leading-9">
            {c.closing}
          </p>
          <p className="mt-7 font-serif text-3xl">
            {c.partner1} & {c.partner2}
          </p>
        </section>
        <p className="mt-9 text-xs">Dirangkai dengan cinta di UndangKita</p>
      </div>
    </div>
  );
}
