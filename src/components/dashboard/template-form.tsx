"use client";
import { useHydrated } from "@/hooks/use-hydrated";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { templateSchema } from "@/validators/template";
import { registry, type TemplateKey } from "@/templates/registry";
import { Field, Input, Textarea, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
type Data = z.infer<typeof templateSchema>;
export function TemplateForm({
  id,
  initial,
  keys,
}: {
  id?: string;
  initial?: Data;
  keys: TemplateKey[];
}) {
  const ready = useHydrated();

  const router = useRouter();
  const key = keys[0] || "minimalist-ivory";
  const form = useForm<Data>({
    resolver: zodResolver(templateSchema),
    defaultValues: initial || {
      key,
      slug: key,
      name: registry[key].name,
      description: registry[key].subtitle,
      category: "WEDDING",
      price: 0,
      isFree: true,
      isActive: true,
      thumbnailUrl: `/previews/${key}.svg`,
    },
  });
  return (
    <form
      noValidate
      className="panel max-w-2xl grid gap-6"
      onSubmit={form.handleSubmit(async (data) => {
        try {
          await apiRequest(
            id
              ? `/api/manage/admin/templates/${id}`
              : "/api/manage/admin/templates",
            id ? "PATCH" : "POST",
            data,
          );
          toast.success("Template tersimpan.");
          router.push("/admin/templates");
          router.refresh();
        } catch (e) {
          toast.error(
            e instanceof Error ? e.message : "Gagal menyimpan template.",
          );
        }
      })}
    >
      <fieldset disabled={!ready} className="contents">
        <Field label="Desain undangan">
          <select
            className={inputClass}
            {...form.register("key")}
            disabled={!!id}
          >
            {keys.map((k) => (
              <option key={k} value={k}>
                {registry[k].name}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Nama template"
          error={form.formState.errors.name?.message}
        >
          <Input {...form.register("name")} />
        </Field>
        <Field
          label="Tautan katalog"
          error={form.formState.errors.slug?.message}
        >
          <Input {...form.register("slug")} />
        </Field>
        <Field
          label="Deskripsi"
          error={form.formState.errors.description?.message}
        >
          <Textarea {...form.register("description")} />
        </Field>
        <Field label="Kategori">
          <select className={inputClass} {...form.register("category")}>
            <option value="WEDDING">Pernikahan</option>
            <option value="ENGAGEMENT">Pertunangan</option>
            <option value="CELEBRATION">Perayaan</option>
          </select>
        </Field>
        <Field
          label="Harga (rupiah)"
          error={form.formState.errors.price?.message}
        >
          <Input
            type="number"
            min={0}
            max={100000000}
            {...form.register("price", { valueAsNumber: true })}
          />
        </Field>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" {...form.register("isFree")} />
          Template gratis (harga harus 0)
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" {...form.register("isActive")} />
          Tampilkan di katalog
        </label>
        <Field
          label="Thumbnail katalog"
          error={form.formState.errors.thumbnailUrl?.message}
        >
          <Input {...form.register("thumbnailUrl")} />
        </Field>
        <p className="text-xs leading-6 text-muted-foreground">
          Perubahan harga berlaku untuk pembelian baru. Transaksi sebelumnya
          tetap menggunakan harga saat pembelian.
        </p>
        {form.formState.errors.root && (
          <p role="alert">Periksa data template.</p>
        )}
        <Button
          type="submit"
          disabled={form.formState.isSubmitting || !keys.length}
        >
          {form.formState.isSubmitting ? "Menyimpan…" : "Simpan template"}
        </Button>
      </fieldset>
    </form>
  );
}
