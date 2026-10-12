"use client";
import { useHydrated } from "@/hooks/use-hydrated";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Music2, VolumeX, Heart } from "lucide-react";
import { TemplateCover, TemplateRenderer } from "@/templates/renderer";
import type { TemplateKey } from "@/templates/registry";
import type {
  InvitationContent,
  InvitationSettings,
} from "@/validators/invitation";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, inputClass } from "@/components/ui/field";
import { apiRequest } from "@/lib/api-client";
import { toast } from "sonner";
export function InvitationExperience({
  slug,
  templateKey,
  content,
  settings,
  guest,
  token,
  wishes,
  rsvp,
}: {
  slug: string;
  templateKey: TemplateKey;
  content: InvitationContent;
  settings: InvitationSettings;
  guest?: string;
  token?: string;
  wishes: { id: string; name: string; message: string }[];
  rsvp?: {
    status: string;
    attendeeCount: number;
    message: string | null;
  } | null;
}) {
  const ready = useHydrated();

  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const key = `visited:${slug}`;
    try {
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        void apiRequest(`/api/public/${slug}/visit`, "POST", {}).catch(
          () => {},
        );
      }
    } catch {
      /* Storage may be unavailable. */
    }
  }, [slug]);
  const open = () => {
    setOpened(true);
    if (audio.current)
      void audio.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
  };
  const toggleMusic = () => {
    if (!audio.current) return;
    if (playing) {
      audio.current.pause();
      setPlaying(false);
    } else
      void audio.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => toast.error("Musik belum dapat diputar."));
  };
  const submit = async (
    event: React.FormEvent<HTMLFormElement>,
    action: string,
  ) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    try {
      await apiRequest(`/api/public/${slug}/${action}`, "POST", {
        token,
        ...Object.fromEntries(data),
        ...(action === "rsvp"
          ? { attendeeCount: Number(data.get("attendeeCount")) }
          : {}),
      });
      toast.success(
        action === "rsvp"
          ? "Terima kasih, konfirmasi tersimpan."
          : settings.moderateWishes
            ? "Ucapan tersimpan dan menunggu tinjauan."
            : "Ucapan tersimpan.",
      );
      if (action === "wishes") form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Jawaban belum tersimpan.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <main id="main">
      {content.musicUrl && (
        <audio ref={audio} src={content.musicUrl} loop preload="none" />
      )}
      {!opened ? (
        <div className="relative mx-auto max-w-[600px]">
          <TemplateCover templateKey={templateKey} content={content} />
          <div className="bg-background px-6 py-8 text-center">
            <p className="text-xs text-muted-foreground">
              Kepada yang terkasih,
            </p>
            <p className="my-4 font-serif text-2xl">
              {guest || "Bapak/Ibu/Saudara/i"}
            </p>
            <Button onClick={open} disabled={!ready}>
              <Heart size={16} />
              Buka undangan
            </Button>
          </div>
        </div>
      ) : (
        <motion.div
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <TemplateRenderer templateKey={templateKey} content={content}>
            {settings.rsvpEnabled && (
              <section className="invitation-section">
                <h2>Konfirmasi kehadiran</h2>
                {token ? (
                  <form
                    noValidate
                    onSubmit={(e) => submit(e, "rsvp")}
                    className="mx-auto max-w-md grid gap-4 text-left"
                  >
                    <fieldset disabled={!ready} className="contents">
                      <p className="mb-5 text-sm">
                        {guest}, kami menantikan kehadiran Anda.
                      </p>
                      <Field label="Apakah Anda akan hadir?">
                        <select
                          name="status"
                          className={inputClass}
                          defaultValue={rsvp?.status || "ATTENDING"}
                        >
                          <option value="ATTENDING">Ya, saya hadir</option>
                          <option value="NOT_ATTENDING">
                            Tidak dapat hadir
                          </option>
                          <option value="MAYBE">Belum dapat memastikan</option>
                        </select>
                      </Field>
                      <Field
                        label={`Jumlah orang (maksimal ${settings.maxAttendees})`}
                      >
                        <Input
                          name="attendeeCount"
                          type="number"
                          min={0}
                          max={settings.maxAttendees}
                          defaultValue={rsvp?.attendeeCount || 1}
                        />
                      </Field>
                      <Field label="Pesan (opsional)">
                        <Textarea
                          name="message"
                          maxLength={1000}
                          defaultValue={rsvp?.message || ""}
                        />
                      </Field>
                      <input
                        name="website"
                        tabIndex={-1}
                        aria-hidden="true"
                        className="hidden"
                        autoComplete="off"
                      />
                      <Button
                        disabled={busy || !!(rsvp && !settings.allowRsvpUpdate)}
                        type="submit"
                      >
                        {rsvp ? "Perbarui konfirmasi" : "Kirim konfirmasi"}
                      </Button>
                      {rsvp && !settings.allowRsvpUpdate && (
                        <p className="text-xs">
                          Konfirmasi sudah tersimpan dan tidak dapat diubah.
                        </p>
                      )}
                    </fieldset>
                  </form>
                ) : (
                  <p className="text-sm leading-7">
                    Buka tautan personal yang dikirim oleh pasangan untuk
                    mengisi RSVP.
                  </p>
                )}
              </section>
            )}
            {settings.wishesEnabled && (
              <section className="invitation-section">
                <h2>Ucapan & doa</h2>
                <form
                  noValidate
                  onSubmit={(e) => submit(e, "wishes")}
                  className="mx-auto max-w-md grid gap-4 text-left"
                >
                  <fieldset disabled={!ready} className="contents">
                    <Field label="Nama">
                      <Input
                        name="name"
                        defaultValue={guest}
                        readOnly={!!guest}
                        required
                        minLength={2}
                        maxLength={100}
                      />
                    </Field>
                    <Field label="Tulis ucapanmu">
                      <Textarea
                        name="message"
                        required
                        minLength={2}
                        maxLength={1000}
                      />
                    </Field>
                    <input
                      name="website"
                      tabIndex={-1}
                      aria-hidden="true"
                      className="hidden"
                      autoComplete="off"
                    />
                    <Button disabled={busy} type="submit">
                      Kirim ucapan
                    </Button>
                    {settings.moderateWishes && (
                      <p className="text-xs text-muted-foreground">
                        Ucapan tampil setelah disetujui pasangan.
                      </p>
                    )}
                  </fieldset>
                </form>
                <div className="mx-auto mt-9 max-w-md space-y-4 text-left">
                  {wishes.map((w) => (
                    <article
                      key={w.id}
                      className="rounded-xl border border-current/15 p-5"
                    >
                      <p className="mb-3 text-sm font-semibold">{w.name}</p>
                      <p className="whitespace-pre-wrap text-sm leading-7">
                        {w.message}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            )}
            <div className="mt-8">
              <Button
                variant="outline"
                onClick={() =>
                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(`Kami mengundang Anda merayakan hari bahagia ${content.partner1} & ${content.partner2}. ${window.location.origin}/i/${slug}`)}`,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              >
                Bagikan undangan
              </Button>
            </div>
          </TemplateRenderer>
        </motion.div>
      )}
      {opened && content.musicUrl && (
        <button
          className="fixed bottom-5 right-5 z-30 rounded-full bg-primary p-4 text-white shadow-lg"
          onClick={toggleMusic}
          aria-label={playing ? "Jeda musik" : "Putar musik"}
        >
          {playing ? <Music2 size={20} /> : <VolumeX size={20} />}
        </button>
      )}
    </main>
  );
}
