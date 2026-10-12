"use client";
import { useHydrated } from "@/hooks/use-hydrated";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { apiRequest } from "@/lib/api-client";
import { toast } from "sonner";
export function ContactForm() {
  const ready = useHydrated();

  const [busy, setBusy] = useState(false);
  return (
    <form
      noValidate
      className="panel mt-8 grid gap-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        setBusy(true);
        try {
          await apiRequest(
            "/api/access/contact",
            "POST",
            Object.fromEntries(new FormData(form)),
          );
          toast.success("Pesan terkirim kepada pengelola.");
          form.reset();
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Pesan belum terkirim.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <fieldset disabled={!ready} className="contents">
        <Field label="Nama">
          <Input name="name" required minLength={2} maxLength={100} />
        </Field>
        <Field label="Alamat email">
          <Input name="email" type="email" required />
        </Field>
        <Field label="Pesan">
          <Textarea name="message" required minLength={10} maxLength={3000} />
        </Field>
        <input
          name="website"
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
          autoComplete="off"
        />
        <Button type="submit" disabled={busy}>
          {busy ? "Mengirim…" : "Kirim pesan"}
        </Button>
      </fieldset>
    </form>
  );
}
