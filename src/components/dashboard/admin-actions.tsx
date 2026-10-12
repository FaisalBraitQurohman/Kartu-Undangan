"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Confirm } from "@/components/ui/confirm";
import { apiRequest } from "@/lib/api-client";
import { toast } from "sonner";
export function AdminAction({
  path,
  label,
  body,
  method = "POST",
  confirm,
}: {
  path: string;
  label: string;
  body?: unknown;
  method?: string;
  confirm?: string;
}) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const run = async () => {
    setBusy(true);
    try {
      await apiRequest(path, method, body);
      router.refresh();
      toast.success("Perubahan tersimpan.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan.");
    } finally {
      setBusy(false);
    }
  };
  const button = (
    <Button
      size="sm"
      variant="outline"
      disabled={busy}
      onClick={confirm ? undefined : run}
    >
      {busy ? "Memproses…" : label}
    </Button>
  );
  return confirm ? (
    <Confirm title={label} description={confirm} onConfirm={run}>
      {button}
    </Confirm>
  ) : (
    button
  );
}
export function UserAdminControls({
  id,
  role,
  disabled,
}: {
  id: string;
  role: "USER" | "ADMIN";
  disabled: boolean;
}) {
  const [newRole, setRole] = useState(role);
  const [newDisabled, setDisabled] = useState(disabled);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        aria-label="Peran pengguna"
        value={newRole}
        onChange={(e) => setRole(e.target.value as "USER" | "ADMIN")}
        className="rounded-lg border border-border p-2"
      >
        <option value="USER">Pengguna</option>
        <option value="ADMIN">Admin</option>
      </select>
      <label className="flex gap-2 text-xs">
        <input
          type="checkbox"
          checked={newDisabled}
          onChange={(e) => setDisabled(e.target.checked)}
        />
        Nonaktif
      </label>
      <AdminAction
        path={`/api/manage/admin/users/${id}`}
        method="PATCH"
        label="Simpan"
        body={{ role: newRole, disabled: newDisabled }}
        confirm="Perubahan peran atau status akan mengakhiri sesi pengguna. Pastikan perubahan ini benar."
      />
    </div>
  );
}
