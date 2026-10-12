"use client";
import { useHydrated } from "@/hooks/use-hydrated";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Confirm } from "@/components/ui/confirm";
import { apiRequest } from "@/lib/api-client";
import { toast } from "sonner";
import { statusLabels } from "./common";
type GuestData = {
  id: string;
  name: string;
  phone: string | null;
  token: string;
  rsvp: { status: string; attendeeCount: number } | null;
};
export function Guests({
  invitationId,
  slug,
  guests,
}: {
  invitationId: string;
  slug: string;
  guests: GuestData[];
}) {
  const ready = useHydrated();

  const router = useRouter();
  const [query, setQuery] = useState("");
  const [edit, setEdit] = useState<GuestData | null>(null);
  const [busy, setBusy] = useState(false);
  const base = `/api/manage/invitations/${invitationId}/guests`;
  const link = (g: GuestData) =>
    `${window.location.origin}/i/${slug}?to=${g.token}`;
  return (
    <div className="space-y-6">
      <form
        noValidate
        key={edit?.id || "new"}
        className="panel grid gap-4 sm:grid-cols-[1fr_1fr_auto]"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const data = new FormData(form);
          setBusy(true);
          try {
            await apiRequest(
              edit ? `${base}/${edit.id}` : base,
              edit ? "PATCH" : "POST",
              { name: data.get("name"), phone: data.get("phone") },
            );
            setEdit(null);
            form.reset();
            router.refresh();
            toast.success(edit ? "Tamu diperbarui." : "Tamu ditambahkan.");
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Gagal menyimpan.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <fieldset disabled={!ready} className="contents">
          <Field label="Nama tamu">
            <Input
              name="name"
              defaultValue={edit?.name}
              required
              minLength={2}
              maxLength={100}
            />
          </Field>
          <Field label="Telepon (opsional)">
            <Input name="phone" defaultValue={edit?.phone || ""} type="tel" />
          </Field>
          <div className="flex items-end gap-2">
            <Button type="submit" disabled={busy}>
              {edit ? "Simpan" : "Tambah tamu"}
            </Button>
            {edit && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEdit(null)}
              >
                Batal
              </Button>
            )}
          </div>
        </fieldset>
      </form>
      <div className="flex flex-wrap justify-between gap-4">
        <Input
          placeholder="Cari nama tamu…"
          aria-label="Cari tamu"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        <Button asChild variant="outline">
          <a href={`${base}?format=csv`}>Ekspor CSV</a>
        </Button>
      </div>
      <div className="panel table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tamu</th>
              <th>Telepon</th>
              <th>RSVP</th>
              <th>Bagikan & kelola</th>
            </tr>
          </thead>
          <tbody>
            {guests
              .filter((g) => g.name.toLowerCase().includes(query.toLowerCase()))
              .map((g) => (
                <tr key={g.id}>
                  <td>{g.name}</td>
                  <td>{g.phone || "—"}</td>
                  <td>
                    {g.rsvp
                      ? `${statusLabels[g.rsvp.status]} (${g.rsvp.attendeeCount})`
                      : "Belum menjawab"}
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(link(g));
                            toast.success("Tautan personal disalin.");
                          } catch {
                            toast.error(
                              "Tautan tidak dapat disalin di browser ini.",
                            );
                          }
                        }}
                      >
                        Salin tautan
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open(
                            `https://wa.me/${g.phone?.replace(/\D/g, "") || ""}?text=${encodeURIComponent(`Halo ${g.name}, kami mengundang Anda ke hari bahagia kami. ${link(g)}`)}`,
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                      >
                        WhatsApp
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEdit(g)}
                      >
                        Edit
                      </Button>
                      <Confirm
                        title="Hapus tamu ini?"
                        description="RSVP milik tamu juga akan dihapus. Tautan personal tidak lagi berlaku."
                        onConfirm={async () => {
                          try {
                            await apiRequest(`${base}/${g.id}`, "DELETE");
                            router.refresh();
                            toast.success("Tamu dihapus.");
                          } catch (e) {
                            toast.error(
                              e instanceof Error
                                ? e.message
                                : "Gagal menghapus.",
                            );
                          }
                        }}
                      >
                        <Button size="sm" variant="ghost">
                          Hapus
                        </Button>
                      </Confirm>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {!guests.length && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Tambahkan tamu untuk membuat tautan personal.
          </p>
        )}
      </div>
    </div>
  );
}
