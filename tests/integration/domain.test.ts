import { beforeAll, afterAll, describe, expect, it, vi } from "vitest";
import { randomBytes, createHash } from "node:crypto";
import { hash, compare } from "bcryptjs";
import { db } from "@/lib/db";
import {
  createInvitation,
  ownedInvitation,
  updateInvitation,
  deleteInvitation,
} from "@/features/invitations/service";
import { templateAccess } from "@/features/templates/service";
import { createGuest } from "@/features/guests/service";
import { submitRsvp } from "@/features/rsvp/service";
import { submitWish } from "@/features/wishes/service";
import {
  processVerifiedStatus,
  checkout,
  paymentWebhook,
} from "@/features/payments/service";
import {
  register,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from "@/features/auth/service";
import { defaultSettings, demoContent } from "@/validators/invitation";
import { secureToken } from "@/lib/security/tokens";
import { sendEmail } from "@/lib/email";
vi.mock("@/lib/email", () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));
describe.skipIf(!process.env.TEST_DATABASE_URL)(
  "PostgreSQL business flows",
  () => {
    const prefix = `qa-${randomBytes(8).toString("hex")}`;
    const ids: string[] = [];
    let userId = "",
      otherId = "",
      freeId = "",
      premiumId = "",
      invitationId = "",
      guestToken = "";
    const orderIds: string[] = [];
    let premiumPrice = 49000;
    beforeAll(async () => {
      const password = await hash(secureToken(), 12);
      for (const suffix of ["a", "b"]) {
        const user = await db.user.create({
          data: {
            name: `${prefix}-${suffix}`,
            email: `${prefix}-${suffix}@example.test`,
            passwordHash: password,
            emailVerified: new Date(),
          },
        });
        ids.push(user.id);
      }
      [userId, otherId] = ids;
      const free = await db.template.findUniqueOrThrow({
        where: { key: "minimalist-ivory" },
      });
      const premium = await db.template.findUniqueOrThrow({
        where: { key: "royal-elegant" },
      });
      freeId = free.id;
      premiumId = premium.id;
      premiumPrice = premium.price;
    });
    afterAll(async () => {
      vi.unstubAllGlobals();
      vi.unstubAllEnvs();
      await db.$transaction(async (tx) => {
        await tx.userTemplate.deleteMany({ where: { userId: { in: ids } } });
        await tx.invitation.deleteMany({ where: { userId: { in: ids } } });
        await tx.paymentEvent.deleteMany({
          where: { orderId: { in: orderIds } },
        });
        await tx.templatePurchase.deleteMany({
          where: { orderId: { in: orderIds } },
        });
        await tx.order.deleteMany({ where: { id: { in: orderIds } } });
        await tx.emailJob.deleteMany({
          where: { key: { in: orderIds.map((id) => `purchase:${id}`) } },
        });
        await tx.emailJob.deleteMany({ where: { to: { startsWith: prefix } } });
        await tx.verificationToken.deleteMany({
          where: { identifier: { startsWith: prefix } },
        });
        await tx.auditLog.deleteMany({
          where: {
            OR: [{ actorId: { in: ids } }, { entityId: { in: orderIds } }],
          },
        });
        await tx.user.deleteMany({ where: { id: { in: ids } } });
      });
      await db.$disconnect();
    });
    it("registers hashed credentials, verifies once, resets password and revokes sessions", async () => {
      const email = `${prefix}-auth@example.test`;
      const password = secureToken();
      await register({ name: "Nama test", email, password });
      const account = await db.user.findUniqueOrThrow({ where: { email } });
      ids.push(account.id);
      expect(account.passwordHash).not.toBe(password);
      expect(await compare(password, account.passwordHash!)).toBe(true);
      const mail = vi.mocked(sendEmail).mock.calls.at(-1)!;
      const token = mail[2].match(/token=([a-f0-9]{64})/)![1];
      await verifyEmail(token);
      await expect(verifyEmail(token)).rejects.toThrow();
      expect(
        (await db.user.findUniqueOrThrow({ where: { email } })).emailVerified,
      ).not.toBeNull();
      await forgotPassword(email);
      const reset = vi
        .mocked(sendEmail)
        .mock.calls.at(-1)![2]
        .match(/token=([a-f0-9]{64})/)![1];
      const newPassword = secureToken();
      await resetPassword({ token: reset, password: newPassword });
      const changed = await db.user.findUniqueOrThrow({ where: { email } });
      expect(changed.sessionVersion).toBe(1);
      expect(await compare(newPassword, changed.passwordHash!)).toBe(true);
      await expect(
        resetPassword({ token: reset, password: newPassword }),
      ).rejects.toThrow();
    });
    it("allows free invitations, rejects unowned premium and cross-user access", async () => {
      const invitation = await createInvitation(userId, {
        templateId: freeId,
        title: "Undangan QA",
        slug: `${prefix}-free`,
      });
      invitationId = invitation.id;
      await expect(
        createInvitation(otherId, {
          templateId: premiumId,
          title: "Ditolak",
          slug: `${prefix}-denied`,
        }),
      ).rejects.toMatchObject({ status: 403 });
      await expect(
        ownedInvitation(otherId, invitation.id),
      ).rejects.toMatchObject({ status: 404 });
      await expect(
        createGuest(otherId, invitation.id, { name: "Tamu" }),
      ).rejects.toMatchObject({ status: 404 });
    });
    it("publishes with compare-and-swap revision and rejects stale edits", async () => {
      const initial = await db.invitation.findUniqueOrThrow({
        where: { id: invitationId },
      });
      const data = {
        title: initial.title,
        slug: initial.slug,
        revision: initial.revision,
        content: demoContent,
        settings: defaultSettings,
        status: "PUBLISHED" as const,
      };
      const published = await updateInvitation(userId, invitationId, data);
      expect(published.status).toBe("PUBLISHED");
      expect(await db.event.count({ where: { invitationId } })).toBe(1);
      await expect(
        updateInvitation(userId, invitationId, data),
      ).rejects.toMatchObject({ status: 409 });
    });
    it("supports personal guest links, RSVP updates, wishes and privacy boundaries", async () => {
      const guest = await createGuest(userId, invitationId, {
        name: "Tamu QA",
        phone: "+628123456789",
      });
      guestToken = guest.token;
      expect(guestToken).toMatch(/^[a-f0-9]{64}$/);
      const slug = `${prefix}-free`;
      await submitRsvp(slug, {
        token: guestToken,
        status: "ATTENDING",
        attendeeCount: 2,
      });
      await submitRsvp(slug, {
        token: guestToken,
        status: "NOT_ATTENDING",
        attendeeCount: 2,
      });
      expect(await db.rSVP.count({ where: { guestId: guest.id } })).toBe(1);
      expect(
        (await db.rSVP.findUniqueOrThrow({ where: { guestId: guest.id } }))
          .attendeeCount,
      ).toBe(0);
      await expect(
        submitRsvp(slug, {
          token: secureToken(),
          status: "ATTENDING",
          attendeeCount: 1,
        }),
      ).rejects.toMatchObject({ status: 404 });
      await submitWish(slug, {
        token: guestToken,
        name: "Pemalsuan nama",
        message: "Selamat berbahagia",
      });
      const wish = await db.wish.findFirstOrThrow({
        where: { guestId: guest.id },
      });
      expect(wish.name).toBe("Tamu QA");
      expect(wish.isApproved).toBe(false);
    });
    it("unpublishes and rejects subsequent public RSVP", async () => {
      const invitation = await db.invitation.findUniqueOrThrow({
        where: { id: invitationId },
      });
      await updateInvitation(userId, invitationId, {
        title: invitation.title,
        slug: invitation.slug,
        revision: invitation.revision,
        content: demoContent,
        settings: defaultSettings,
        status: "DRAFT",
      });
      await expect(
        submitRsvp(invitation.slug, {
          token: guestToken,
          status: "ATTENDING",
          attendeeCount: 1,
        }),
      ).rejects.toMatchObject({ status: 404 });
    });
    it("reserves one checkout under concurrent requests and uses server prices", async () => {
      vi.stubEnv("MIDTRANS_SERVER_KEY", "sandbox-unit-boundary");
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          new Response(
            JSON.stringify({
              token: "sandbox-test-token",
              redirect_url: "https://app.sandbox.midtrans.com/test",
            }),
            { status: 201 },
          ),
        ),
      );
      const result = await Promise.allSettled([
        checkout(userId, premiumId),
        checkout(userId, premiumId),
      ]);
      expect(result.some((r) => r.status === "fulfilled")).toBe(true);
      const orders = await db.order.findMany({ where: { userId } });
      orderIds.push(...orders.map((o) => o.id));
      expect(orders).toHaveLength(1);
      expect(orders[0].totalAmount).toBe(premiumPrice);
      expect(vi.mocked(fetch).mock.calls[0][1]?.body).toContain(
        `"gross_amount":${premiumPrice}`,
      );
      vi.unstubAllGlobals();
    });
    it("handles amount mismatch, webhook retries, out-of-order states and permanent ownership", async () => {
      const order = await db.order.findFirstOrThrow({ where: { userId } });
      const verified = {
        order_id: order.orderNumber,
        status_code: "200",
        gross_amount: `${premiumPrice}.00`,
        transaction_status: "settlement",
        transaction_id: `${prefix}-transaction`,
      };
      await expect(
        processVerifiedStatus({ ...verified, gross_amount: "1.00" }),
      ).rejects.toMatchObject({ status: 400 });
      await processVerifiedStatus(verified);
      await processVerifiedStatus(verified);
      expect(
        await db.userTemplate.count({
          where: { userId, templateId: premiumId },
        }),
      ).toBe(1);
      expect(
        await db.paymentEvent.count({ where: { orderId: order.id } }),
      ).toBe(1);
      await processVerifiedStatus({
        ...verified,
        transaction_status: "pending",
      });
      expect(
        (await db.order.findUniqueOrThrow({ where: { id: order.id } })).status,
      ).toBe("PAID");
      await expect(checkout(userId, premiumId)).rejects.toMatchObject({
        status: 409,
      });
      for (let i = 0; i < 3; i++)
        await createInvitation(userId, {
          templateId: premiumId,
          title: `Premium ${i}`,
          slug: `${prefix}-premium-${i}`,
        });
      expect(
        await db.invitation.count({ where: { userId, templateId: premiumId } }),
      ).toBe(3);
    });
    it("verifies a signed webhook using authoritative provider status and deduplicates concurrent retries", async () => {
      vi.stubEnv("MIDTRANS_SERVER_KEY", "sandbox-unit-boundary");
      vi.stubEnv("MIDTRANS_IS_PRODUCTION", "false");
      const order = await db.order.create({
        data: {
          userId: otherId,
          orderNumber: `${prefix}-signed`,
          totalAmount: premiumPrice,
          activePurchaseKey: `${otherId}:${premiumId}`,
          purchases: {
            create: { templateId: premiumId, unitPrice: premiumPrice },
          },
        },
      });
      orderIds.push(order.id);
      const verified = {
        order_id: order.orderNumber,
        status_code: "200",
        gross_amount: `${premiumPrice}.00`,
        transaction_status: "settlement",
        transaction_id: `${prefix}-signed-transaction`,
      };
      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockImplementation(
            async () => new Response(JSON.stringify(verified), { status: 200 }),
          ),
      );
      const notification = {
        ...verified,
        transaction_status: "pending",
        signature_key: createHash("sha512")
          .update(
            `${order.orderNumber}200${premiumPrice}.00sandbox-unit-boundary`,
          )
          .digest("hex"),
      };
      await Promise.all([
        paymentWebhook(notification),
        paymentWebhook(notification),
      ]);
      expect(
        await db.userTemplate.count({
          where: { userId: otherId, templateId: premiumId },
        }),
      ).toBe(1);
      expect(
        await db.paymentEvent.count({ where: { orderId: order.id } }),
      ).toBe(1);
      expect(
        (await db.order.findUniqueOrThrow({ where: { id: order.id } })).status,
      ).toBe("PAID");
      vi.unstubAllGlobals();
    });
    it("deletes only the owner's invitation and cascades its private guest data", async () => {
      await expect(
        deleteInvitation(otherId, invitationId),
      ).rejects.toMatchObject({ status: 404 });
      await deleteInvitation(userId, invitationId);
      expect(
        await db.invitation.findUnique({ where: { id: invitationId } }),
      ).toBeNull();
      expect(await db.guest.count({ where: { invitationId } })).toBe(0);
    });
    it("rejects invalid webhook signatures before granting access and revokes only refunded grants", async () => {
      const order = await db.order.findFirstOrThrow({ where: { userId } });
      await expect(
        paymentWebhook({
          order_id: order.orderNumber,
          status_code: "200",
          gross_amount: `${premiumPrice}.00`,
          transaction_status: "settlement",
          signature_key: "0".repeat(128),
        }),
      ).rejects.toMatchObject({ status: 401 });
      await processVerifiedStatus({
        order_id: order.orderNumber,
        status_code: "200",
        gross_amount: `${premiumPrice}.00`,
        transaction_status: "refund",
        transaction_id: `${prefix}-transaction`,
      });
      await expect(templateAccess(userId, premiumId)).rejects.toMatchObject({
        status: 403,
      });
      expect(await db.order.count({ where: { id: order.id } })).toBe(1);
      expect(
        await db.paymentEvent.count({ where: { orderId: order.id } }),
      ).toBeGreaterThan(1);
    });
  },
);
