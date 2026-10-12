import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, requireAdmin } from "@/lib/auth/guards";
import { AppError, errorResponse } from "@/lib/security/errors";
import { readJson, requireSameOrigin } from "@/lib/security/request";
import { rateLimit } from "@/lib/security/rate-limit";
import {
  createInvitation,
  ownedInvitation,
  updateInvitation,
  deleteInvitation,
} from "@/features/invitations/service";
import { createGuest, updateGuest, csvCell } from "@/features/guests/service";
import { checkout, processVerifiedStatus } from "@/features/payments/service";
import { transactionStatus } from "@/lib/payments/midtrans";
import { uploadMedia, deleteMedia } from "@/lib/storage/cloudinary";
import { saveTemplate, updateUser } from "@/features/admin/service";
import { compare, hash } from "bcryptjs";
import { passwordSchema } from "@/validators/auth";
import { deliverEmailOutbox } from "@/lib/email-outbox";
import { revalidateTag } from "next/cache";
import { secureToken } from "@/lib/security/tokens";
type Context = { params: Promise<{ path: string[] }> };
async function handleOperation(request: Request, context: Context) {
  try {
    const { path } = await context.params;
    const [resource, id, section, itemId] = path;
    const method = request.method;
    const user = await requireUser();
    if (method !== "GET") {
      requireSameOrigin(request);
      await rateLimit(`manage:${user.id}`, 60);
    }
    if (resource === "checkout" && method === "POST")
      return Response.json(
        await checkout(
          user.id,
          z
            .object({ templateId: z.string().min(1) })
            .parse(await readJson(request)).templateId,
        ),
      );
    if (resource === "profile" && method === "PATCH") {
      const data = z
        .object({
          name: z.string().trim().min(2).max(100),
          currentPassword: z.string().optional(),
          password: passwordSchema.optional(),
        })
        .parse(await readJson(request));
      const account = await db.user.findUniqueOrThrow({
        where: { id: user.id },
      });
      if (
        data.password &&
        (!data.currentPassword ||
          !account.passwordHash ||
          !(await compare(data.currentPassword, account.passwordHash)))
      )
        throw new AppError(422, "Kata sandi lama tidak sesuai.");
      await db.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: {
            name: data.name,
            ...(data.password
              ? {
                  passwordHash: await hash(data.password, 12),
                  sessionVersion: { increment: 1 },
                }
              : {}),
          },
        });
        await tx.auditLog.create({
          data: {
            actorId: user.id,
            action: "PROFILE_UPDATED",
            entityType: "User",
            entityId: user.id,
          },
        });
        if (data.password)
          await tx.emailJob.create({
            data: {
              key: `password-change:${user.id}:${secureToken()}`,
              to: user.email,
              subject: "Kata sandi diperbarui",
              text: "Kata sandi akun Anda telah diubah. Silakan masuk kembali. Hubungi pengelola jika Anda tidak melakukan perubahan ini.",
            },
          });
      });
      return Response.json({
        message: "Profil diperbarui. Jika kata sandi diubah, masuk kembali.",
      });
    }
    if (resource === "invitations") {
      if (!id && method === "GET")
        return Response.json(
          await db.invitation.findMany({
            where: { userId: user.id },
            orderBy: { updatedAt: "desc" },
            take: 100,
          }),
        );
      if (!id && method === "POST")
        return Response.json(
          await createInvitation(user.id, await readJson(request)),
          { status: 201 },
        );
      if (!id) throw new AppError(404, "Undangan tidak ditemukan.");
      const invitation = await ownedInvitation(user.id, id);
      if (!section && method === "GET") return Response.json(invitation);
      if (!section && method === "DELETE") {
        await deleteInvitation(user.id, id);
        revalidateTag(`invitation:${id}`, { expire: 0 });
        return Response.json({ message: "Undangan dihapus." });
      }
      if (!section && method === "PATCH") {
        const saved = await updateInvitation(
          user.id,
          id,
          await readJson(request),
        );
        revalidateTag(`invitation:${id}`, { expire: 0 });
        return Response.json(saved);
      }
      if (section === "guests") {
        if (method === "GET") {
          const guests = await db.guest.findMany({
            where: { invitationId: id },
            include: { rsvp: true },
            orderBy: { createdAt: "desc" },
          });
          if (new URL(request.url).searchParams.get("format") === "csv")
            return new Response(
              "\uFEFF" +
                [
                  "Nama,Telepon,Status,Jumlah,Tautan",
                  ...guests.map((g) =>
                    [
                      g.name,
                      g.phone || "",
                      g.rsvp?.status || "Belum menjawab",
                      String(g.rsvp?.attendeeCount || 0),
                      `${new URL(request.url).origin}/i/${invitation.slug}?to=${g.token}`,
                    ]
                      .map(csvCell)
                      .join(","),
                  ),
                ].join("\r\n"),
              {
                headers: {
                  "Content-Type": "text/csv; charset=utf-8",
                  "Content-Disposition": 'attachment; filename="tamu.csv"',
                },
              },
            );
          return Response.json(guests);
        }
        if (method === "POST")
          return Response.json(
            await createGuest(user.id, id, await readJson(request)),
            { status: 201 },
          );
        if (method === "PATCH" && itemId) {
          await updateGuest(user.id, id, itemId, await readJson(request));
          return Response.json({ message: "Tamu diperbarui." });
        }
        if (method === "DELETE" && itemId) {
          await db.guest.deleteMany({
            where: { id: itemId, invitationId: id },
          });
          return Response.json({ message: "Tamu dihapus." });
        }
      }
      if (section === "rsvps" && method === "GET")
        return Response.json(
          await db.rSVP.findMany({
            where: { guest: { invitationId: id } },
            include: { guest: { select: { name: true } } },
          }),
        );
      if (section === "wishes") {
        if (method === "GET")
          return Response.json(
            await db.wish.findMany({
              where: { invitationId: id },
              orderBy: { createdAt: "desc" },
              take: 500,
            }),
          );
        if (method === "PATCH" && itemId) {
          const { isApproved } = z
            .object({ isApproved: z.boolean() })
            .parse(await readJson(request));
          await db.wish.updateMany({
            where: { id: itemId, invitationId: id },
            data: { isApproved },
          });
          return Response.json({ message: "Ucapan diperbarui." });
        }
        if (method === "DELETE" && itemId) {
          await db.wish.deleteMany({ where: { id: itemId, invitationId: id } });
          return Response.json({ message: "Ucapan dihapus." });
        }
      }
      if (section === "media") {
        if (method === "GET")
          return Response.json(
            await db.media.findMany({ where: { invitationId: id } }),
          );
        if (method === "POST") {
          if (Number(request.headers.get("content-length")) > 4.4 * 1024 * 1024)
            throw new AppError(413, "Berkas terlalu besar.");
          const file = (await request.formData()).get("file");
          if (!(file instanceof File))
            throw new AppError(422, "Pilih berkas terlebih dahulu.");
          return Response.json(await uploadMedia(user.id, id, file), {
            status: 201,
          });
        }
        if (method === "DELETE" && itemId) {
          await deleteMedia(user.id, id, itemId);
          return Response.json({ message: "Media dihapus." });
        }
      }
    }
    if (resource === "admin") {
      const admin = await requireAdmin();
      if (id === "invitations" && section && method === "PATCH") {
        const { status } = z
          .object({ status: z.enum(["ARCHIVED", "DRAFT"]) })
          .parse(await readJson(request));
        await db.$transaction(async (tx) => {
          await tx.invitation.update({
            where: { id: section },
            data: { status, publishedAt: null, revision: { increment: 1 } },
          });
          await tx.auditLog.create({
            data: {
              actorId: admin.id,
              action: "INVITATION_MODERATED",
              entityType: "Invitation",
              entityId: section,
              metadata: { status },
            },
          });
        });
        return Response.json({ message: "Status undangan diperbarui." });
      }
      if (id === "templates" && method === "POST")
        return Response.json(
          await saveTemplate(admin.id, await readJson(request)),
          { status: 201 },
        );
      if (id === "templates" && section && method === "PATCH")
        return Response.json(
          await saveTemplate(admin.id, await readJson(request), section),
        );
      if (id === "users" && section && method === "PATCH") {
        await updateUser(
          admin.id,
          section,
          z
            .object({ role: z.enum(["USER", "ADMIN"]), disabled: z.boolean() })
            .parse(await readJson(request)),
        );
        return Response.json({ message: "Pengguna diperbarui." });
      }
      if (id === "wishes" && section && method === "PATCH") {
        const { isApproved } = z
          .object({ isApproved: z.boolean() })
          .parse(await readJson(request));
        await db.$transaction(async (tx) => {
          await tx.wish.update({
            where: { id: section },
            data: { isApproved },
          });
          await tx.auditLog.create({
            data: {
              actorId: admin.id,
              action: "WISH_MODERATED",
              entityType: "Wish",
              entityId: section,
              metadata: { isApproved },
            },
          });
        });
        return Response.json({ message: "Moderasi tersimpan." });
      }
      if (id === "orders" && section && method === "POST") {
        const order = await db.order.findUniqueOrThrow({
          where: { id: section },
        });
        return Response.json({
          status: await processVerifiedStatus(
            await transactionStatus(order.orderNumber),
          ),
        });
      }
      if (id === "email" && method === "POST") {
        const options = request.headers
          .get("content-type")
          ?.includes("application/json")
          ? z
              .object({ retryFailed: z.boolean().optional() })
              .parse(await readJson(request))
          : {};
        return Response.json(await deliverEmailOutbox(options));
      }
    }
    throw new AppError(404, "Rute tidak ditemukan.");
  } catch (error) {
    return errorResponse(error);
  }
}
async function handler(request: Request, context: Context) {
  const response = await handleOperation(request, context);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Vary", "Cookie");
  return response;
}
export { handler as GET, handler as POST, handler as PATCH, handler as DELETE };
