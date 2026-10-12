"use client";
import { useHydrated } from "@/hooks/use-hydrated";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { invitationUpdateSchema } from "@/validators/invitation";
import { TemplateRenderer } from "@/templates/renderer";
import type { TemplateKey } from "@/templates/registry";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Confirm } from "@/components/ui/confirm";
import { apiRequest } from "@/lib/api-client";
import { toast } from "sonner";
import { useElementWidth } from "@/hooks/use-element-width";
import { Monitor, Smartphone, Save, Send, Plus, Trash2 } from "lucide-react";
type Values = z.infer<typeof invitationUpdateSchema>;
type EditorMedia = { id: string; url: string; type: "IMAGE" | "AUDIO" };
const sections = [
  "Informasi dasar",
  "Identitas pasangan",
  "Informasi keluarga",
  "Detail acara",
  "Cerita kami",
  "Galeri foto",
  "Musik",
  "Warna & tampilan",
  "Pengaturan RSVP",
  "Publikasi",
];
export function InvitationEditor({
  id,
  templateKey,
  initial,
  media: initialMedia,
}: {
  id: string;
  templateKey: TemplateKey;
  initial: Values;
  media: EditorMedia[];
}) {
  const ready = useHydrated();

  const { ref: previewRef, width: previewWidth } = useElementWidth();
  const form = useForm<Values>({
    resolver: zodResolver(invitationUpdateSchema),
    defaultValues: initial,
  });
  const events = useFieldArray({
    control: form.control,
    name: "content.events",
  });
  const stories = useFieldArray({
    control: form.control,
    name: "content.story",
  });
  const gallery = useFieldArray({
    control: form.control,
    name: "content.gallery",
  });
  const [section, setSection] = useState(0);
  const [tab, setTab] = useState("edit");
  const [device, setDevice] = useState("mobile");
  const [media, setMedia] = useState(initialMedia);
  const [uploading, setUploading] = useState(false);
  const content = useWatch({ control: form.control, name: "content" });
  const status = useWatch({ control: form.control, name: "status" });
  const slug = useWatch({ control: form.control, name: "slug" });
  useEffect(() => {
    const leave = (event: BeforeUnloadEvent) => {
      if (form.formState.isDirty) event.preventDefault();
    };
    const navigate = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest("a");
      if (
        anchor?.href &&
        form.formState.isDirty &&
        !window.confirm("Perubahan belum disimpan. Tinggalkan editor?")
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", leave);
    document.addEventListener("click", navigate, true);
    return () => {
      window.removeEventListener("beforeunload", leave);
      document.removeEventListener("click", navigate, true);
    };
  }, [form.formState.isDirty]);
  const save = (nextStatus: Values["status"]) =>
    form.handleSubmit(
      async (values) => {
        try {
          const saved = await apiRequest<Values>(
            `/api/manage/invitations/${id}`,
            "PATCH",
            { ...values, status: nextStatus },
          );
          form.reset({
            ...values,
            status: saved.status,
            revision: saved.revision,
          });
          toast.success(
            nextStatus === "PUBLISHED"
              ? "Undangan tersimpan dan terpublikasi."
              : "Draf undangan tersimpan.",
          );
        } catch (e) {
          toast.error(
            e instanceof Error ? e.message : "Undangan belum tersimpan.",
          );
        }
      },
      () => toast.error("Periksa isian yang belum valid di bagian editor."),
    );
  const upload = async (file: File) => {
    setUploading(true);
    try {
      const body = new FormData();
      body.set("file", file);
      const uploaded = await apiRequest<EditorMedia>(
        `/api/manage/invitations/${id}/media`,
        "POST",
        body,
      );
      setMedia((items) => [...items, uploaded]);
      if (uploaded.type === "AUDIO")
        form.setValue("content.musicUrl", uploaded.url, { shouldDirty: true });
      else gallery.append({ url: uploaded.url, caption: "" });
      toast.success("Media diunggah. Simpan untuk menampilkannya di undangan.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload gagal.");
    } finally {
      setUploading(false);
    }
  };
  const text = (
    label: string,
    name:
      | "title"
      | "slug"
      | `content.${"partner1" | "partner2" | "partner1Full" | "partner2Full" | "family1" | "family2" | "greeting" | "quote" | "closing"}`,
    multiline = false,
  ) => (
    <Field label={label}>
      {multiline ? (
        <Textarea {...form.register(name)} />
      ) : (
        <Input {...form.register(name)} />
      )}
    </Field>
  );
  return (
    <div>
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="display text-3xl">Editor undangan</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            {form.formState.isDirty
              ? "Ada perubahan yang belum disimpan"
              : "Semua perubahan tersimpan"}{" "}
            · {status === "PUBLISHED" ? "Terpublikasi" : "Draf"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={save(status)}
            disabled={form.formState.isSubmitting}
          >
            <Save size={16} />
            Simpan {status === "DRAFT" ? "draf" : "perubahan"}
          </Button>
          <Button
            onClick={save("PUBLISHED")}
            disabled={form.formState.isSubmitting}
          >
            <Send size={16} />
            Publikasikan
          </Button>
        </div>
      </header>
      <div className="mb-4 flex gap-2 xl:hidden">
        <Button
          variant={tab === "edit" ? "default" : "outline"}
          onClick={() => setTab("edit")}
        >
          Edit isi
        </Button>
        <Button
          variant={tab === "preview" ? "default" : "outline"}
          onClick={() => setTab("preview")}
        >
          Pratinjau
        </Button>
      </div>
      <div className="grid gap-5 xl:grid-cols-[180px_minmax(280px,1fr)_minmax(340px,1fr)]">
        <nav
          className={`space-y-1 ${tab === "preview" ? "hidden xl:block" : ""}`}
          aria-label="Bagian editor"
        >
          {sections.map((s, i) => (
            <button
              key={s}
              onClick={() => setSection(i)}
              className={`w-full rounded-xl px-3 py-3 text-left text-xs ${i === section ? "bg-primary text-white" : "hover:bg-secondary"}`}
            >
              {s}
            </button>
          ))}
        </nav>
        <form
          noValidate
          className={`panel min-w-0 grid gap-5 ${tab === "preview" ? "hidden xl:block" : ""}`}
          onSubmit={(e) => e.preventDefault()}
        >
          <fieldset disabled={!ready} className="contents">
            <h2 className="mb-6 font-serif text-2xl">{sections[section]}</h2>
            {section === 0 && (
              <>
                {text("Judul undangan", "title")}
                {text("Tautan undangan", "slug")}
                <p className="text-xs leading-6 text-muted-foreground">
                  Mengubah tautan akan mengubah URL yang dibagikan kepada tamu.
                </p>
                {text("Pembuka", "content.greeting", true)}
                {text("Kutipan", "content.quote", true)}
              </>
            )}
            {section === 1 && (
              <>
                {text("Nama panggilan mempelai pertama", "content.partner1")}
                {text("Nama lengkap mempelai pertama", "content.partner1Full")}
                {text("Nama panggilan mempelai kedua", "content.partner2")}
                {text("Nama lengkap mempelai kedua", "content.partner2Full")}
              </>
            )}
            {section === 2 && (
              <>
                {text("Keluarga mempelai pertama", "content.family1", true)}
                {text("Keluarga mempelai kedua", "content.family2", true)}
              </>
            )}
            {section === 3 && (
              <>
                {events.fields.map((item, i) => (
                  <fieldset
                    className="space-y-4 rounded-xl border border-border p-4"
                    key={item.id}
                  >
                    <legend className="px-2 text-xs">Acara {i + 1}</legend>
                    <Field label="Nama acara">
                      <Input {...form.register(`content.events.${i}.title`)} />
                    </Field>
                    <Field label="Mulai">
                      <Input
                        type="datetime-local"
                        value={
                          content.events[i]?.startAt
                            ? toLocal(content.events[i].startAt)
                            : ""
                        }
                        onChange={(e) =>
                          form.setValue(
                            `content.events.${i}.startAt`,
                            e.target.value
                              ? new Date(e.target.value).toISOString()
                              : "",
                            { shouldDirty: true },
                          )
                        }
                      />
                    </Field>
                    <Field label="Selesai (opsional)">
                      <Input
                        type="datetime-local"
                        value={
                          content.events[i]?.endAt
                            ? toLocal(content.events[i].endAt)
                            : ""
                        }
                        onChange={(e) =>
                          form.setValue(
                            `content.events.${i}.endAt`,
                            e.target.value
                              ? new Date(e.target.value).toISOString()
                              : "",
                            { shouldDirty: true },
                          )
                        }
                      />
                    </Field>
                    <Field label="Nama tempat">
                      <Input {...form.register(`content.events.${i}.venue`)} />
                    </Field>
                    <Field label="Alamat lengkap">
                      <Textarea
                        {...form.register(`content.events.${i}.address`)}
                      />
                    </Field>
                    <Field label="Catatan acara">
                      <Textarea
                        {...form.register(`content.events.${i}.description`)}
                      />
                    </Field>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => events.remove(i)}
                    >
                      <Trash2 size={14} />
                      Hapus acara
                    </Button>
                  </fieldset>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    events.append({
                      title: "Resepsi",
                      description: "",
                      startAt: "",
                      endAt: "",
                      venue: "",
                      address: "",
                      latitude: null,
                      longitude: null,
                    })
                  }
                  disabled={events.fields.length >= 10}
                >
                  <Plus size={15} />
                  Tambah acara
                </Button>
              </>
            )}
            {section === 4 && (
              <>
                {stories.fields.map((item, i) => (
                  <div
                    key={item.id}
                    className="space-y-4 rounded-xl border border-border p-4"
                  >
                    <Field label="Judul cerita">
                      <Input {...form.register(`content.story.${i}.title`)} />
                    </Field>
                    <Field label="Tahun atau tanggal">
                      <Input {...form.register(`content.story.${i}.date`)} />
                    </Field>
                    <Field label="Cerita">
                      <Textarea
                        {...form.register(`content.story.${i}.description`)}
                      />
                    </Field>
                    <Button
                      variant="ghost"
                      type="button"
                      size="sm"
                      onClick={() => stories.remove(i)}
                    >
                      Hapus cerita
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    stories.append({ title: "", date: "", description: "" })
                  }
                  disabled={stories.fields.length >= 20}
                >
                  Tambah cerita
                </Button>
              </>
            )}
            {section === 5 && (
              <>
                <Field label="Unggah foto (JPG, PNG, WebP)">
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void upload(f);
                      e.target.value = "";
                    }}
                  />
                </Field>
                <p className="text-xs text-muted-foreground">
                  Maksimal 30 foto. Foto maksimal 3 MB. Kuota penyimpanan
                  berlaku per akun.
                </p>
                {gallery.fields.map((g, i) => (
                  <div
                    key={g.id}
                    className="space-y-3 rounded-xl border border-border p-4"
                  >
                    <p className="truncate text-xs text-muted-foreground">
                      Foto {i + 1}
                    </p>
                    <Field label="Keterangan foto">
                      <Input
                        {...form.register(`content.gallery.${i}.caption`)}
                      />
                    </Field>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => gallery.remove(i)}
                      size="sm"
                    >
                      Hapus dari galeri
                    </Button>
                  </div>
                ))}
                <div className="space-y-3 border-t border-border pt-5">
                  <p className="text-xs font-semibold">Berkas yang diunggah</p>
                  {media
                    .filter((m) => m.type === "IMAGE")
                    .map((m) => (
                      <div key={m.id} className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={content.gallery.some(
                            (g) => g.url === m.url,
                          )}
                          onClick={() =>
                            gallery.append({ url: m.url, caption: "" })
                          }
                        >
                          Tambahkan ke galeri
                        </Button>
                        <Confirm
                          title="Hapus berkas foto?"
                          description="Hapus dari galeri dan simpan dulu. Berkas yang dihapus tidak dapat dipulihkan."
                          onConfirm={async () => {
                            try {
                              await apiRequest(
                                `/api/manage/invitations/${id}/media/${m.id}`,
                                "DELETE",
                              );
                              setMedia((v) => v.filter((a) => a.id !== m.id));
                              toast.success("Berkas dihapus.");
                            } catch (e) {
                              toast.error(
                                String(e instanceof Error ? e.message : e),
                              );
                            }
                          }}
                        >
                          <Button type="button" variant="ghost" size="sm">
                            Hapus berkas
                          </Button>
                        </Confirm>
                      </div>
                    ))}
                </div>
              </>
            )}
            {section === 6 && (
              <>
                <Field label="Unggah musik (MP3 atau OGG, maksimal 4 MB)">
                  <Input
                    type="file"
                    accept="audio/mpeg,audio/ogg"
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void upload(f);
                      e.target.value = "";
                    }}
                  />
                </Field>
                <p className="text-xs leading-6 text-muted-foreground">
                  Gunakan musik dengan izin yang sesuai. Musik diputar setelah
                  tamu membuka undangan.
                </p>
                {media
                  .filter((m) => m.type === "AUDIO")
                  .map((m) => (
                    <div key={m.id} className="space-y-3">
                      <audio controls src={m.url} className="w-full" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          form.setValue(
                            "content.musicUrl",
                            content.musicUrl ? "" : m.url,
                            { shouldDirty: true },
                          )
                        }
                      >
                        {content.musicUrl
                          ? "Nonaktifkan musik"
                          : "Gunakan musik"}
                      </Button>
                      <Confirm
                        title="Hapus musik?"
                        description="Nonaktifkan musik dan simpan dulu sebelum menghapus berkas."
                        onConfirm={async () => {
                          try {
                            await apiRequest(
                              `/api/manage/invitations/${id}/media/${m.id}`,
                              "DELETE",
                            );
                            setMedia((v) => v.filter((a) => a.id !== m.id));
                            toast.success("Musik dihapus.");
                          } catch (e) {
                            toast.error(
                              e instanceof Error
                                ? e.message
                                : "Gagal menghapus.",
                            );
                          }
                        }}
                      >
                        <Button type="button" variant="ghost" size="sm">
                          Hapus berkas
                        </Button>
                      </Confirm>
                    </div>
                  ))}
              </>
            )}
            {section === 7 && (
              <>
                <Field label="Warna aksen">
                  <Input
                    type="color"
                    {...form.register("content.accent")}
                    className="h-14"
                  />
                </Field>
                <p className="text-xs leading-6 text-muted-foreground">
                  Warna ini dipakai pada garis dekorasi dan detail undangan.
                  Komposisi desain mengikuti template yang dipilih.
                </p>
                {text("Penutup", "content.closing", true)}
              </>
            )}
            {section === 8 && (
              <>
                {(
                  [
                    ["rsvpEnabled", "Aktifkan RSVP"],
                    ["allowRsvpUpdate", "Izinkan tamu memperbarui RSVP"],
                    ["wishesEnabled", "Aktifkan ucapan"],
                    ["moderateWishes", "Tinjau ucapan sebelum tampil"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex gap-3 text-sm">
                    <input
                      type="checkbox"
                      {...form.register(`settings.${key}`)}
                    />
                    {label}
                  </label>
                ))}
                <Field label="Maksimal orang per tamu">
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    {...form.register("settings.maxAttendees", {
                      valueAsNumber: true,
                    })}
                  />
                </Field>
              </>
            )}
            {section === 9 && (
              <>
                <p className="text-sm leading-7">
                  Draf hanya dapat dilihat pemilik. Setelah dipublikasikan,
                  undangan bisa dibuka melalui tautan publik.
                </p>
                <p className="rounded-xl bg-secondary/50 p-4 text-sm">
                  /i/{slug}
                </p>
                {status === "PUBLISHED" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={save("DRAFT")}
                  >
                    Batalkan publikasi
                  </Button>
                )}
                <p className="text-xs leading-6 text-muted-foreground">
                  Tidak ada biaya publikasi ulang atau masa aktif undangan.
                </p>
              </>
            )}
            {uploading && (
              <p className="text-xs" role="status">
                Mengunggah media…
              </p>
            )}
            {Object.keys(form.formState.errors).length > 0 && (
              <p className="text-sm text-red-700" role="alert">
                Periksa judul, tautan, warna, dan detail acara. Data belum
                valid.
              </p>
            )}
          </fieldset>
        </form>
        <section
          className={`${tab === "edit" ? "hidden xl:block" : ""} min-w-0`}
          aria-label="Pratinjau undangan"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-medium">Pratinjau langsung</span>
            <div className="flex gap-1">
              <Button
                variant={device === "mobile" ? "default" : "ghost"}
                size="sm"
                onClick={() => setDevice("mobile")}
                aria-label="Pratinjau seluler"
              >
                <Smartphone size={16} />
              </Button>
              <Button
                variant={device === "desktop" ? "default" : "ghost"}
                size="sm"
                onClick={() => setDevice("desktop")}
                aria-label="Pratinjau desktop"
              >
                <Monitor size={16} />
              </Button>
            </div>
          </div>
          <div
            ref={previewRef}
            className="max-h-[750px] overflow-auto rounded-2xl border border-border bg-secondary p-3"
          >
            <div
              className={`mx-auto overflow-hidden rounded-xl ${device === "mobile" ? "max-w-[390px]" : "w-full"}`}
              style={
                device === "desktop"
                  ? {
                      width: 860,
                      zoom: Math.max(0.1, (previewWidth - 24) / 860),
                    }
                  : undefined
              }
            >
              <TemplateRenderer templateKey={templateKey} content={content} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
function toLocal(iso: string) {
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}
