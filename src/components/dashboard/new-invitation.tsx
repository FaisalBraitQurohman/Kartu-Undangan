"use client";
import { useHydrated } from "@/hooks/use-hydrated";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invitationCreateSchema } from "@/validators/invitation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, Input, inputClass } from "@/components/ui/field";
import { apiRequest } from "@/lib/api-client";
import { toast } from "sonner";
export function NewInvitation({
  templates,
  selected,
}: {
  templates: { id: string; name: string }[];
  selected?: string;
}) {
  const ready = useHydrated();

  const router = useRouter();
  const form = useForm<z.infer<typeof invitationCreateSchema>>({
    resolver: zodResolver(invitationCreateSchema),
    defaultValues: {
      templateId: selected || templates[0]?.id,
      title: "",
      slug: "",
    },
  });
  return (
    <form
      noValidate
      className="panel max-w-xl grid gap-6"
      onSubmit={form.handleSubmit(async (data) => {
        try {
          const created = await apiRequest<{ id: string }>(
            "/api/manage/invitations",
            "POST",
            data,
          );
          router.push(`/dashboard/invitations/${created.id}/edit`);
          router.refresh();
        } catch (e) {
          toast.error(
            e instanceof Error ? e.message : "Gagal membuat undangan.",
          );
        }
      })}
    >
      <fieldset disabled={!ready} className="contents">
        <Field
          label="Judul undangan"
          error={form.formState.errors.title?.message}
        >
          <Input
            {...form.register("title")}
            placeholder="Pernikahan Alya & Rizky"
          />
        </Field>
        <Field
          label="Tautan undangan"
          error={form.formState.errors.slug?.message}
        >
          <Input {...form.register("slug")} placeholder="alya-dan-rizky" />
          <span className="text-xs text-muted-foreground">
            Tautan publik: /i/nama-undangan
          </span>
        </Field>
        <Field label="Template">
          <select {...form.register("templateId")} className={inputClass}>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>
        <Button
          disabled={form.formState.isSubmitting || !templates.length}
          type="submit"
        >
          {form.formState.isSubmitting ? "Membuat…" : "Buat draf undangan"}
        </Button>
      </fieldset>
    </form>
  );
}
