"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Confirm } from "@/components/ui/confirm";
import { apiRequest } from "@/lib/api-client";
import { toast } from "sonner";
export function Wishes({
  wishes,
  invitationId,
  admin = false,
}: {
  wishes: { id: string; name: string; message: string; isApproved: boolean }[];
  invitationId?: string;
  admin?: boolean;
}) {
  const router = useRouter();
  const base = admin
    ? "/api/manage/admin/wishes"
    : `/api/manage/invitations/${invitationId}/wishes`;
  const mutate = async (id: string, method: string, body?: unknown) => {
    try {
      await apiRequest(`${base}/${id}`, method, body);
      router.refresh();
      toast.success("Ucapan diperbarui.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Perubahan gagal.");
    }
  };
  return (
    <div className="grid gap-4">
      {wishes.map((w) => (
        <article key={w.id} className="panel">
          <div className="mb-4 flex justify-between gap-4">
            <h2 className="font-semibold">{w.name}</h2>
            <span className="pill">
              {w.isApproved ? "Ditampilkan" : "Menunggu tinjauan"}
            </span>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-7">{w.message}</p>
          <div className="mt-5 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                mutate(w.id, "PATCH", { isApproved: !w.isApproved })
              }
            >
              {w.isApproved ? "Sembunyikan" : "Tampilkan"}
            </Button>
            {!admin && (
              <Confirm
                title="Hapus ucapan?"
                description="Ucapan yang dihapus tidak dapat dipulihkan."
                onConfirm={() => mutate(w.id, "DELETE")}
              >
                <Button size="sm" variant="ghost">
                  Hapus
                </Button>
              </Confirm>
            )}
          </div>
        </article>
      ))}
      {!wishes.length && (
        <p className="panel text-sm text-muted-foreground">Belum ada ucapan.</p>
      )}
    </div>
  );
}
