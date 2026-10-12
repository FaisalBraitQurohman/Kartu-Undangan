import { db } from "@/lib/db";
import { pageAdmin } from "@/lib/auth/guards";
import { PageTitle } from "@/components/dashboard/common";
import { money } from "@/lib/utils";
export default async function Page() {
  await pageAdmin();
  const [users, invitations, published, purchases, revenue, templates] =
    await Promise.all([
      db.user.count(),
      db.invitation.count(),
      db.invitation.count({ where: { status: "PUBLISHED" } }),
      db.templatePurchase.count({ where: { order: { status: "PAID" } } }),
      db.order.aggregate({
        where: { status: "PAID" },
        _sum: { totalAmount: true },
      }),
      db.template.findMany({
        include: { _count: { select: { owners: true, invitations: true } } },
        orderBy: { name: "asc" },
      }),
    ]);
  return (
    <>
      <PageTitle
        title="Ringkasan platform"
        description="Statistik dari akun, undangan, dan transaksi terverifikasi."
      />
      <div className="mb-10 grid gap-4 md:grid-cols-3">
        {[
          ["Pengguna", users],
          ["Undangan", invitations],
          ["Terpublikasi", published],
          ["Pembelian template lunas", purchases],
          ["Penjualan lunas (bruto)", money(revenue._sum.totalAmount || 0)],
        ].map(([label, value]) => (
          <div className="panel" key={label}>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-4 font-serif text-3xl">{value}</p>
          </div>
        ))}
      </div>
      <h2 className="mb-5 font-serif text-2xl">Popularitas template</h2>
      <div className="panel table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Template</th>
              <th>Pemilik</th>
              <th>Undangan dibuat</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t._count.owners}</td>
                <td>{t._count.invitations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
