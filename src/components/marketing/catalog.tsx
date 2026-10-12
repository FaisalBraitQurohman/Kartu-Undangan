import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/utils";
import { activeTemplates } from "@/features/templates/service";
export async function Catalog({ limit }: { limit?: number }) {
  const templates = process.env.DATABASE_URL
    ? await activeTemplates().catch(() => null)
    : null;
  if (templates === null)
    return (
      <div className="rounded-2xl border border-border p-8 text-center text-sm text-muted-foreground">
        Katalog sementara belum tersedia. Silakan kembali lagi nanti.
      </div>
    );
  if (!templates.length)
    return (
      <p className="py-8 text-muted-foreground">
        Pilihan desain baru sedang disiapkan. Kembali lagi segera.
      </p>
    );
  return (
    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
      {templates.slice(0, limit).map((t) => (
        <article key={t.id} className="group">
          <Link
            href={`/templates/${t.slug}`}
            className="block overflow-hidden rounded-t-[100px] rounded-b-2xl bg-secondary p-4"
          >
            <Image
              src={t.thumbnailUrl}
              alt={`Desain undangan ${t.name}`}
              width={400}
              height={520}
              className="aspect-[4/5] w-full rounded-t-[80px] rounded-b-xl object-cover transition-transform group-hover:scale-[1.025]"
            />
          </Link>
          <div className="pt-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-serif text-xl">{t.name}</h3>
              <span className="pill">{t.isFree ? "Gratis" : "Premium"}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {t.category === "WEDDING"
                ? "Pernikahan"
                : t.category === "ENGAGEMENT"
                  ? "Pertunangan"
                  : "Perayaan"}
            </p>
            <p className="my-4 text-sm font-semibold">
              {t.isFree
                ? "Gratis selamanya"
                : `${money(t.price)} · sekali beli`}
            </p>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/templates/${t.slug}`}>Lihat desain</Link>
              </Button>
              <Button asChild size="sm">
                <Link href={`/templates/${t.slug}#gunakan`}>
                  {t.isFree ? "Gunakan" : "Beli template"}
                </Link>
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
