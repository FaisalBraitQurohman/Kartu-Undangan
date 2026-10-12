"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Confirm } from "@/components/ui/confirm";
import { apiRequest } from "@/lib/api-client";
import { toast } from "sonner";
export function DeleteInvitationButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <Confirm
      title="Hapus undangan?"
      description="Undangan, tamu, RSVP, dan ucapan akan dihapus permanen. Hapus berkas foto dan musik melalui editor terlebih dahulu. Template milikmu tetap tersedia."
      onConfirm={async () => {
        try {
          await apiRequest(`/api/manage/invitations/${id}`, "DELETE");
          toast.success("Undangan dihapus.");
          router.refresh();
        } catch (e) {
          toast.error(
            e instanceof Error ? e.message : "Undangan belum dapat dihapus.",
          );
        }
      }}
    >
      <Button variant="ghost" size="sm">
        Hapus
      </Button>
    </Confirm>
  );
}
