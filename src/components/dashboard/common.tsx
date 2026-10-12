import Link from "next/link";
import { Button } from "@/components/ui/button";
export const statusLabels: Record<string, string> = {
  DRAFT: "Draf",
  PUBLISHED: "Terpublikasi",
  ARCHIVED: "Diarsipkan",
  CREATED: "Diproses",
  PENDING: "Menunggu pembayaran",
  PAID: "Lunas",
  FAILED: "Gagal",
  CANCELLED: "Dibatalkan",
  EXPIRED: "Pembayaran kedaluwarsa",
  REFUNDED: "Dikembalikan",
  CHARGEBACK: "Sengketa pembayaran",
  ATTENDING: "Hadir",
  NOT_ATTENDING: "Tidak hadir",
  MAYBE: "Belum pasti",
  USER: "Pengguna",
  ADMIN: "Admin",
  WEDDING: "Pernikahan",
  ENGAGEMENT: "Pertunangan",
  CELEBRATION: "Perayaan",
};
export function PageTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="display text-3xl md:text-4xl">{title}</h1>
        {description && (
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
export function EmptyState({
  title,
  description,
  href,
  label,
}: {
  title: string;
  description: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center">
      <h2 className="font-serif text-2xl">{title}</h2>
      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted-foreground">
        {description}
      </p>
      {href && (
        <Button asChild className="mt-6">
          <Link href={href}>{label}</Link>
        </Button>
      )}
    </div>
  );
}
