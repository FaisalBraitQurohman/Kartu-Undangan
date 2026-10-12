"use client";
import { useHydrated } from "@/hooks/use-hydrated";
import { useState } from "react";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";
import { toast } from "sonner";
export function ProfileForm({ name, email }: { name: string; email: string }) {
  const ready = useHydrated();

  const [busy, setBusy] = useState(false);
  return (
    <form
      noValidate
      className="panel max-w-xl grid gap-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const data = new FormData(e.currentTarget);
        try {
          await apiRequest("/api/manage/profile", "PATCH", {
            name: data.get("name"),
            ...(data.get("password")
              ? {
                  password: data.get("password"),
                  currentPassword: data.get("currentPassword"),
                }
              : {}),
          });
          toast.success(
            "Profil diperbarui. Jika kata sandi berubah, masuk kembali.",
          );
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Gagal menyimpan.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <fieldset disabled={!ready} className="contents">
        <Field label="Nama lengkap">
          <Input
            name="name"
            defaultValue={name}
            required
            minLength={2}
            maxLength={100}
          />
        </Field>
        <Field label="Email">
          <Input value={email} readOnly />
        </Field>
        <p className="border-t border-border pt-6 text-sm font-semibold">
          Ubah kata sandi (opsional)
        </p>
        <Field label="Kata sandi saat ini">
          <Input
            name="currentPassword"
            type="password"
            autoComplete="current-password"
          />
        </Field>
        <Field label="Kata sandi baru">
          <Input
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={72}
          />
        </Field>
        <Button disabled={busy} type="submit">
          {busy ? "Menyimpan…" : "Simpan perubahan"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Hubungi pengelola untuk bantuan terkait akun dan data pribadi.
        </p>
      </fieldset>
    </form>
  );
}
