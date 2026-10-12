import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { pageAdmin } from "@/lib/auth/guards";
import { PageTitle, statusLabels } from "@/components/dashboard/common";
import { Button } from "@/components/ui/button";
import {
  AdminAction,
  UserAdminControls,
} from "@/components/dashboard/admin-actions";
import { TemplateForm } from "@/components/dashboard/template-form";
import { Wishes } from "@/components/dashboard/wishes";
import { templateKeys, isTemplateKey } from "@/templates/registry";
import { templateSchema } from "@/validators/template";
import { dateLabel, money } from "@/lib/utils";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ path: string[] }>;
  searchParams: Promise<{ page?: string }>;
}) {
  await pageAdmin();
  const [section, id, action] = (await params).path;
  const total = !id ? await countSection(section) : 0;
  const requested = Math.min(
    100000,
    Math.max(1, Number((await searchParams).page) || 1),
  );
  const page = Math.min(
    Math.floor(requested),
    Math.max(1, Math.ceil(total / 50)),
  );
  const pagination = total > 0 ? { page, total, section } : undefined;
  if (section === "users" && !id) {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        disabledAt: true,
        emailVerified: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      skip: (page - 1) * 50,
    });
    return (
      <>
        <PageTitle
          title="Pengguna"
          description="Kelola peran dan status akun. Akun dinonaktifkan tanpa menghapus catatan transaksi."
        />
        <Table
          pagination={pagination}
          headers={["Nama", "Email", "Verifikasi", "Peran & status"]}
        >
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.emailVerified ? "Terverifikasi" : "Menunggu"}</td>
              <td>
                <UserAdminControls
                  id={u.id}
                  role={u.role}
                  disabled={!!u.disabledAt}
                />
              </td>
            </tr>
          ))}
        </Table>
      </>
    );
  }
  if (section === "templates") {
    if (id === "new") {
      const used = await db.template.findMany({ select: { key: true } });
      const keys = templateKeys.filter((k) => !used.some((t) => t.key === k));
      return (
        <>
          <PageTitle
            title="Tambah template"
            description="Pilih desain yang belum tersedia di katalog."
          />
          {keys.length ? (
            <TemplateForm keys={keys} />
          ) : (
            <p className="panel text-sm">
              Semua desain tersedia sudah ada di katalog.{" "}
              <Link href="/admin/templates" className="underline">
                Kelola template yang ada.
              </Link>
            </p>
          )}
        </>
      );
    }
    if (id && action === "edit") {
      const template = await db.template.findUnique({ where: { id } });
      if (!template || !isTemplateKey(template.key)) notFound();
      return (
        <>
          <PageTitle title="Edit template" description={template.name} />
          <TemplateForm
            id={id}
            initial={templateSchema.parse(template)}
            keys={[template.key]}
          />
        </>
      );
    }
    if (!id) {
      const templates = await db.template.findMany({
        orderBy: { name: "asc" },
      });
      return (
        <>
          <PageTitle
            title="Template"
            description="Harga, katalog, dan ketersediaan desain."
            action={
              <Button asChild>
                <Link href="/admin/templates/new">Tambah template</Link>
              </Button>
            }
          />
          <Table
            pagination={pagination}
            headers={["Nama", "Harga", "Jenis", "Katalog", "Kelola"]}
          >
            {templates.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{money(t.price)}</td>
                <td>{t.isFree ? "Gratis" : "Premium"}</td>
                <td>{t.isActive ? "Aktif" : "Tidak ditampilkan"}</td>
                <td>
                  <Link
                    className="underline"
                    href={`/admin/templates/${t.id}/edit`}
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </Table>
        </>
      );
    }
  }
  if (section === "invitations" && !id) {
    const invitations = await db.invitation.findMany({
      include: {
        user: { select: { email: true } },
        template: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      skip: (page - 1) * 50,
    });
    return (
      <>
        <PageTitle title="Undangan platform" />
        <Table
          pagination={pagination}
          headers={["Judul", "Pemilik", "Template", "Status", "Moderasi"]}
        >
          {invitations.map((i) => (
            <tr key={i.id}>
              <td>{i.title}</td>
              <td>{i.user.email}</td>
              <td>{i.template.name}</td>
              <td>{statusLabels[i.status]}</td>
              <td>
                <AdminAction
                  path={`/api/manage/admin/invitations/${i.id}`}
                  method="PATCH"
                  label="Arsipkan"
                  body={{ status: "ARCHIVED" }}
                  confirm="Undangan tidak lagi dapat diakses publik. Pemilik tetap dapat melihatnya di dashboard."
                />
              </td>
            </tr>
          ))}
        </Table>
      </>
    );
  }
  if (section === "orders" && !id) {
    const orders = await db.order.findMany({
      include: {
        user: { select: { email: true } },
        purchases: { include: { template: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      skip: (page - 1) * 50,
    });
    return (
      <>
        <PageTitle
          title="Pesanan"
          description="Pemeriksaan mengambil status terkini dari Midtrans, tanpa membuat transaksi baru."
        />
        <Table
          headers={[
            "Nomor pesanan",
            "Pengguna",
            "Template",
            "Total",
            "Status",
            "Periksa",
          ]}
        >
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.orderNumber}</td>
              <td>{o.user.email}</td>
              <td>{o.purchases.map((p) => p.template.name).join(", ")}</td>
              <td>{money(o.totalAmount)}</td>
              <td>{statusLabels[o.status]}</td>
              <td>
                <AdminAction
                  path={`/api/manage/admin/orders/${o.id}`}
                  label="Periksa status"
                />
              </td>
            </tr>
          ))}
        </Table>
      </>
    );
  }
  if (section === "payments" && !id) {
    const events = await db.paymentEvent.findMany({
      include: { order: { select: { orderNumber: true, status: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
      skip: (page - 1) * 50,
    });
    return (
      <>
        <PageTitle
          title="Audit pembayaran"
          description="Notifikasi yang telah diverifikasi dan diproses server."
        />
        <Table
          headers={[
            "Pesanan",
            "Status pesanan terkini",
            "Diterima",
            "Diproses",
          ]}
        >
          {events.map((e) => (
            <tr key={e.id}>
              <td>{e.order.orderNumber}</td>
              <td>{statusLabels[e.order.status]}</td>
              <td>{dateLabel(e.createdAt)}</td>
              <td>{e.processedAt ? dateLabel(e.processedAt) : "Belum"}</td>
            </tr>
          ))}
        </Table>
      </>
    );
  }
  if (section === "wishes" && !id) {
    const wishes = await db.wish.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      skip: (page - 1) * 50,
    });
    return (
      <>
        <PageTitle title="Moderasi ucapan" />
        <Wishes wishes={wishes} admin />
        <Pagination value={pagination} />
      </>
    );
  }
  if (section === "audit-logs" && !id) {
    const logs = await db.auditLog.findMany({
      include: { actor: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
      skip: (page - 1) * 50,
    });
    return (
      <>
        <PageTitle
          title="Log aktivitas"
          description="Catatan perubahan akun, undangan, template, dan pembayaran."
        />
        <Table
          pagination={pagination}
          headers={["Waktu", "Pelaku", "Aktivitas", "Entitas"]}
        >
          {logs.map((l) => (
            <tr key={l.id}>
              <td>{dateLabel(l.createdAt)}</td>
              <td>{l.actor?.email || "Sistem"}</td>
              <td>{l.action}</td>
              <td>
                {l.entityType}: {l.entityId}
              </td>
            </tr>
          ))}
        </Table>
      </>
    );
  }
  if (section === "settings" && !id) {
    const pending = await db.emailJob.count({ where: { sentAt: null } });
    const failed = await db.emailJob.count({
      where: { sentAt: null, attempts: { gte: 10 } },
    });
    return (
      <>
        <PageTitle
          title="Pengaturan layanan"
          description="Konfigurasi layanan dikelola melalui lingkungan deployment. Rahasia tidak ditampilkan di dashboard."
        />
        <div className="panel max-w-2xl space-y-4">
          {[
            ["Database", !!process.env.DATABASE_URL],
            ["Pembayaran", !!process.env.MIDTRANS_SERVER_KEY],
            ["Media", !!process.env.CLOUDINARY_API_SECRET],
            [
              "Email",
              process.env.EMAIL_DELIVERY_ENABLED === "true" &&
                !!process.env.RESEND_API_KEY,
            ],
            ["Pembatasan permintaan", !!process.env.UPSTASH_REDIS_REST_TOKEN],
            ["Pemantauan", !!process.env.SENTRY_DSN],
          ].map(([name, ready]) => (
            <div
              key={String(name)}
              className="flex justify-between border-b border-border pb-3 text-sm"
            >
              <span>{String(name)}</span>
              <span>{ready ? "Dikonfigurasi" : "Belum tersedia"}</span>
            </div>
          ))}
          <p className="text-sm">{pending} email menunggu pengiriman.</p>
          <AdminAction
            path="/api/manage/admin/email"
            label="Proses antrean email"
          />
          {failed > 0 && (
            <>
              <p className="text-sm">
                {failed} email memerlukan percobaan ulang.
              </p>
              <AdminAction
                path="/api/manage/admin/email"
                label="Coba ulang email gagal"
                body={{ retryFailed: true }}
              />
            </>
          )}
        </div>
      </>
    );
  }
  notFound();
}
function Table({
  headers,
  children,
  pagination,
}: {
  headers: string[];
  children: React.ReactNode;
  pagination?: { page: number; total: number; section: string };
}) {
  return (
    <>
      <div className="panel table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
      <Pagination value={pagination} />
    </>
  );
}

function Pagination({
  value,
}: {
  value?: { page: number; total: number; section: string };
}) {
  if (!value) return null;
  const { page, total, section } = value;
  return (
    <nav
      aria-label="Halaman hasil"
      className="mt-6 flex items-center justify-between gap-4 text-sm"
    >
      <span>
        Halaman {page} dari {Math.max(1, Math.ceil(total / 50))} ({total} data)
      </span>
      <div className="flex gap-3">
        {page > 1 && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/${section}?page=${page - 1}`}>Sebelumnya</Link>
          </Button>
        )}
        {page * 50 < total && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/${section}?page=${page + 1}`}>Berikutnya</Link>
          </Button>
        )}
      </div>
    </nav>
  );
}
async function countSection(section: string) {
  switch (section) {
    case "users":
      return db.user.count();
    case "invitations":
      return db.invitation.count();
    case "orders":
      return db.order.count();
    case "payments":
      return db.paymentEvent.count();
    case "wishes":
      return db.wish.count();
    case "audit-logs":
      return db.auditLog.count();
    default:
      return 0;
  }
}
