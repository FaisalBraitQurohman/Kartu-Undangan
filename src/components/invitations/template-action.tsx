"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
export function TemplateAction({
  templateId,
  usable,
  authenticated,
}: {
  templateId: string;
  usable: boolean;
  authenticated: boolean;
}) {
  const [busy, setBusy] = useState(false);
  if (!authenticated)
    return (
      <Button asChild>
        <Link href="/login">Masuk untuk menggunakan</Link>
      </Button>
    );
  if (usable)
    return (
      <Button asChild>
        <Link href={`/dashboard/invitations/new?template=${templateId}`}>
          Buat undangan
        </Link>
      </Button>
    );
  return (
    <Button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const res = await fetch("/api/manage/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ templateId }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          window.location.assign(data.redirectUrl);
        } catch (e) {
          toast.error(
            e instanceof Error ? e.message : "Pembayaran belum tersedia.",
          );
          setBusy(false);
        }
      }}
    >
      {busy ? "Menyiapkan pembayaran…" : "Beli template sekali"}
    </Button>
  );
}
