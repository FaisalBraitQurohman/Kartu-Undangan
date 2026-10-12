import Link from "next/link";
import { db } from "@/lib/db";
import { pageUser } from "@/lib/auth/guards";
import {
  PageTitle,
  EmptyState,
  statusLabels,
} from "@/components/dashboard/common";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Heart, Users, Mail, Palette } from "lucide-react";
export default async function Page() {
  const user = await pageUser();
  const [count, published, owned, guests, recent] = await Promise.all([
    db.invitation.count({ where: { userId: user.id } }),
    db.invitation.count({ where: { userId: user.id, status: "PUBLISHED" } }),
    db.userTemplate.count({ where: { userId: user.id } }),
    db.guest.count({ where: { invitation: { userId: user.id } } }),
    db.invitation.findMany({
      where: { userId: user.id },
      include: { template: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);
  return (
    <>
      <PageTitle
        title="Cerita indahmu, di satu tempat."
        description="Kelola undangan dan sambut kabar dari para tamu."
        action={
          <Button asChild>
            <Link href="/dashboard/invitations/new">
              Buat undangan
              <ArrowUpRight size={17} />
            </Link>
          </Button>
        }
      />
      <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [Heart, "Undangan", count],
          [Mail, "Terpublikasi", published],
          [Palette, "Template dimiliki", owned],
          [Users, "Tamu diundang", guests],
        ].map(([Icon, label, value]) => {
          const I = Icon as typeof Heart;
          return (
            <div key={String(label)} className="panel">
              <I size={22} className="text-ring" />
              <p className="mb-3 mt-5 text-xs text-muted-foreground">
                {String(label)}
              </p>
              <p className="font-serif text-4xl">{String(value)}</p>
            </div>
          );
        })}
      </div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-serif text-2xl">Undangan terakhir</h2>
        <Link href="/dashboard/invitations" className="text-sm underline">
          Lihat semua
        </Link>
      </div>
      {recent.length ? (
        <div className="panel table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Undangan</th>
                <th>Template</th>
                <th>Status</th>
                <th>Kelola</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((i) => (
                <tr key={i.id}>
                  <td>{i.title}</td>
                  <td>{i.template.name}</td>
                  <td>
                    <span className="pill">{statusLabels[i.status]}</span>
                  </td>
                  <td>
                    <Link
                      href={`/dashboard/invitations/${i.id}/edit`}
                      className="underline"
                    >
                      Edit undangan
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="Satu undangan, awal sebuah cerita."
          description="Pilih template dan buat undangan pertamamu. Template gratis tersedia untuk memulai."
          href="/dashboard/invitations/new"
          label="Buat undangan pertama"
        />
      )}
    </>
  );
}
