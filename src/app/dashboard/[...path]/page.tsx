import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { pageUser } from "@/lib/auth/guards";
import { ownedInvitation } from "@/features/invitations/service";
import {
  PageTitle,
  EmptyState,
  statusLabels,
} from "@/components/dashboard/common";
import { Button } from "@/components/ui/button";
import { Catalog } from "@/components/marketing/catalog";
import { NewInvitation } from "@/components/dashboard/new-invitation";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { Guests } from "@/components/dashboard/guests";
import { Wishes } from "@/components/dashboard/wishes";
import { InvitationEditor } from "@/components/invitations/editor";
import { DeleteInvitationButton } from "@/components/dashboard/delete-invitation";
import { isTemplateKey } from "@/templates/registry";
import { contentSchema, settingsSchema } from "@/validators/invitation";
import { money, dateLabel } from "@/lib/utils";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ path: string[] }>;
  searchParams: Promise<{ template?: string }>;
}) {
  const [section, id, view] = (await params).path;
  const user = await pageUser();
  if (section === "templates" && !id)
    return (
      <>
        <PageTitle
          title="Temukan desain favoritmu."
          description="Setiap template dibeli sekali, lalu menjadi milik akunmu."
        />
        <Catalog />
      </>
    );
  if (section === "my-templates" && !id) {
    const templates = await db.template.findMany({
      where: {
        OR: [
          { isActive: true, isFree: true },
          { owners: { some: { userId: user.id } } },
        ],
      },
      orderBy: { name: "asc" },
    });
    return (
      <>
        <PageTitle
          title="Template saya"
          description="Gunakan kembali desain milikmu untuk undangan sebanyak yang kamu mau."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((t) => (
            <article key={t.id} className="panel">
              <span className="pill">
                {t.isFree ? "Gratis" : "Milikmu selamanya"}
              </span>
              <h2 className="my-5 font-serif text-2xl">{t.name}</h2>
              <p className="mb-6 text-sm leading-7 text-muted-foreground">
                {t.description}
              </p>
              <Button asChild>
                <Link href={`/dashboard/invitations/new?template=${t.id}`}>
                  Buat undangan
                </Link>
              </Button>
            </article>
          ))}
        </div>
        {!templates.length && (
          <EmptyState
            title="Belum ada template."
            description="Temukan desain favorit untuk memulai."
            href="/dashboard/templates"
            label="Jelajahi template"
          />
        )}
      </>
    );
  }
  if (section === "settings" && !id)
    return (
      <>
        <PageTitle
          title="Pengaturan akun"
          description="Jaga identitas dan keamanan akunmu."
        />
        <ProfileForm name={user.name} email={user.email} />
      </>
    );
  if (section === "purchases" && !id) {
    const orders = await db.order.findMany({
      where: { userId: user.id },
      include: {
        purchases: { include: { template: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    return (
      <>
        <PageTitle
          title="Riwayat pembelian"
          description="Pembelian sekali, akses permanen untuk template yang dibeli."
        />
        {!orders.length ? (
          <EmptyState
            title="Belum ada pembelian."
            description="Template gratis bisa digunakan tanpa transaksi."
            href="/dashboard/templates"
            label="Jelajahi template"
          />
        ) : (
          <div className="panel table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pesanan</th>
                  <th>Template</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                  <th>Pembayaran</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.orderNumber}</td>
                    <td>
                      {o.purchases.map((p) => p.template.name).join(", ")}
                    </td>
                    <td>{money(o.totalAmount)}</td>
                    <td>{statusLabels[o.status]}</td>
                    <td>{dateLabel(o.createdAt)}</td>
                    <td>
                      {o.status === "PENDING" && o.redirectUrl ? (
                        <a href={o.redirectUrl} className="underline">
                          Lanjutkan pembayaran
                        </a>
                      ) : o.status === "CREATED" ? (
                        "Hubungi pengelola untuk pemeriksaan"
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    );
  }
  if (section === "invitations" && id === "new") {
    const templates = await db.template.findMany({
      where: {
        OR: [
          { isActive: true, isFree: true },
          { owners: { some: { userId: user.id } } },
        ],
      },
      select: { id: true, name: true },
    });
    return (
      <>
        <PageTitle
          title="Mulai sebuah cerita baru."
          description="Pilih template milikmu atau gunakan template gratis."
        />
        {templates.length ? (
          <NewInvitation
            templates={templates}
            selected={(await searchParams).template}
          />
        ) : (
          <EmptyState
            title="Pilih template terlebih dahulu."
            description="Katalog menyediakan desain gratis dan premium."
            href="/dashboard/templates"
            label="Pilih template"
          />
        )}
      </>
    );
  }
  if (section === "invitations" && !id) {
    const invitations = await db.invitation.findMany({
      where: { userId: user.id },
      include: {
        template: { select: { name: true } },
        _count: { select: { guests: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    return (
      <>
        <PageTitle
          title="Undangan saya"
          description="Tanpa batas jumlah undangan dan tanpa masa aktif."
          action={
            <Button asChild>
              <Link href="/dashboard/invitations/new">Buat undangan</Link>
            </Button>
          }
        />
        {invitations.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {invitations.map((i) => (
              <article key={i.id} className="panel">
                <span className="pill">{statusLabels[i.status]}</span>
                <h2 className="my-5 font-serif text-2xl">{i.title}</h2>
                <p className="text-xs text-muted-foreground">
                  {i.template.name} · {i._count.guests} tamu
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href={`/dashboard/invitations/${i.id}/edit`}>
                      Edit
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/invitations/${i.id}/guests`}>
                      Kelola tamu
                    </Link>
                  </Button>
                  {i.status === "PUBLISHED" && (
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/i/${i.slug}`} target="_blank">
                        Buka undangan
                      </Link>
                    </Button>
                  )}
                  <DeleteInvitationButton id={i.id} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Belum ada undangan."
            description="Buat undangan pertamamu dari template yang kamu sukai."
            href="/dashboard/invitations/new"
            label="Buat undangan"
          />
        )}
      </>
    );
  }
  if (
    section === "invitations" &&
    id &&
    ["edit", "guests", "rsvps", "wishes"].includes(view)
  ) {
    const invitation = await ownedInvitation(user.id, id);
    if (view === "edit") {
      const [template, media] = await Promise.all([
        db.template.findUniqueOrThrow({ where: { id: invitation.templateId } }),
        db.media.findMany({
          where: { invitationId: id },
          select: { id: true, url: true, type: true },
        }),
      ]);
      if (!isTemplateKey(template.key)) notFound();
      return (
        <InvitationEditor
          id={id}
          templateKey={template.key}
          media={media}
          initial={{
            title: invitation.title,
            slug: invitation.slug,
            status: invitation.status,
            revision: invitation.revision,
            content: contentSchema.parse(invitation.content),
            settings: settingsSchema.parse(invitation.settings),
          }}
        />
      );
    }
    const tabs = (
      <nav
        className="mb-6 flex flex-wrap gap-5 text-sm"
        aria-label="Menu undangan"
      >
        {[
          ["edit", "Editor"],
          ["guests", "Tamu"],
          ["rsvps", "RSVP"],
          ["wishes", "Ucapan"],
        ].map(([v, l]) => (
          <Link
            key={v}
            href={`/dashboard/invitations/${id}/${v}`}
            className={
              v === view
                ? "font-semibold underline underline-offset-8"
                : "text-muted-foreground"
            }
          >
            {l}
          </Link>
        ))}
      </nav>
    );
    if (view === "guests") {
      const guests = await db.guest.findMany({
        where: { invitationId: id },
        include: { rsvp: true },
        orderBy: { createdAt: "desc" },
      });
      return (
        <>
          <PageTitle
            title={invitation.title}
            description="Daftar tamu dan tautan personal hanya dapat dilihat pemilik undangan."
          />
          {tabs}
          <Guests invitationId={id} slug={invitation.slug} guests={guests} />
        </>
      );
    }
    if (view === "wishes") {
      const wishes = await db.wish.findMany({
        where: { invitationId: id },
        orderBy: { createdAt: "desc" },
      });
      return (
        <>
          <PageTitle title="Ucapan & doa" description={invitation.title} />
          {tabs}
          <Wishes invitationId={id} wishes={wishes} />
        </>
      );
    }
    const rsvps = await db.rSVP.findMany({
      where: { guest: { invitationId: id } },
      include: { guest: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
    });
    const attending = rsvps
      .filter((r) => r.status === "ATTENDING")
      .reduce((sum, r) => sum + r.attendeeCount, 0);
    return (
      <>
        <PageTitle
          title="Konfirmasi kehadiran"
          description={`${invitation.title} · ${attending} orang akan hadir`}
        />
        {tabs}
        <div className="panel table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tamu</th>
                <th>Kehadiran</th>
                <th>Jumlah</th>
                <th>Pesan</th>
              </tr>
            </thead>
            <tbody>
              {rsvps.map((r) => (
                <tr key={r.id}>
                  <td>{r.guest.name}</td>
                  <td>{statusLabels[r.status]}</td>
                  <td>{r.attendeeCount}</td>
                  <td>{r.message || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rsvps.length && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Belum ada konfirmasi kehadiran.
            </p>
          )}
        </div>
      </>
    );
  }
  notFound();
}
