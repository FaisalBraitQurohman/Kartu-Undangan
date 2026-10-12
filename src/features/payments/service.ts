import { db } from "@/lib/db";
import { serializable } from "@/lib/db/transaction";
import { AppError } from "@/lib/security/errors";
import { secureToken, tokenHash } from "@/lib/security/tokens";
import { appUrl, money } from "@/lib/utils";
import {
  amountInRupiah,
  midtransHeaders,
  midtransKey,
  notificationSchema,
  transactionStatus,
  verifySignature,
  type ProviderStatus,
} from "@/lib/payments/midtrans";
import { nextPaymentState, paymentState } from "./state";
import type { Prisma } from "@prisma/client";
export async function checkout(userId: string, templateId: string) {
  midtransKey();
  const reserved = await serializable(async (tx) => {
    const template = await tx.template.findUnique({
      where: { id: templateId },
    });
    if (!template?.isActive || template.isFree || template.price < 1)
      throw new AppError(
        400,
        "Template ini tidak memerlukan pembayaran atau tidak tersedia.",
      );
    if (
      await tx.userTemplate.findUnique({
        where: { userId_templateId: { userId, templateId } },
      })
    )
      throw new AppError(
        409,
        "Template sudah Anda miliki. Langsung gunakan untuk membuat undangan.",
      );
    const key = `${userId}:${templateId}`;
    const active = await tx.order.findUnique({
      where: { activePurchaseKey: key },
    });
    if (active) return { order: active, created: false, template };
    const order = await tx.order.create({
      data: {
        userId,
        orderNumber: `UK-${secureToken().slice(0, 24)}`,
        totalAmount: template.price,
        activePurchaseKey: key,
        purchases: { create: { templateId, unitPrice: template.price } },
      },
    });
    return { order, created: true, template };
  });
  if (!reserved.created) {
    if (reserved.order.snapToken)
      return {
        token: reserved.order.snapToken,
        redirectUrl: reserved.order.redirectUrl,
        orderId: reserved.order.id,
      };
    throw new AppError(
      409,
      "Pembayaran sedang dipersiapkan. Periksa riwayat pembelian atau hubungi pengelola jika berlanjut.",
    );
  }
  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: { name: true, email: true },
  });
  const base =
    process.env.MIDTRANS_IS_PRODUCTION === "true"
      ? "https://app.midtrans.com"
      : "https://app.sandbox.midtrans.com";
  const res = await fetch(`${base}/snap/v1/transactions`, {
    method: "POST",
    headers: midtransHeaders(),
    body: JSON.stringify({
      transaction_details: {
        order_id: reserved.order.orderNumber,
        gross_amount: reserved.order.totalAmount,
      },
      item_details: [
        {
          id: reserved.template.id,
          name: reserved.template.name.slice(0, 50),
          price: reserved.order.totalAmount,
          quantity: 1,
        },
      ],
      customer_details: { first_name: user.name, email: user.email },
      callbacks: { finish: `${appUrl()}/dashboard/purchases` },
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    // Keep uncertain requests reserved. A lost response is not proof that checkout failed.
    if (res.status >= 400 && res.status < 500 && res.status !== 409)
      await db.order.update({
        where: { id: reserved.order.id },
        data: { status: "FAILED", activePurchaseKey: null },
      });
    throw new AppError(
      503,
      "Pembayaran belum dapat dimulai. Periksa riwayat pembelian.",
    );
  }
  const payload = (await res.json()) as {
    token?: string;
    redirect_url?: string;
  };
  if (
    !payload.token ||
    !payload.redirect_url ||
    new URL(payload.redirect_url).origin !== base
  )
    throw new AppError(503, "Respons pembayaran tidak valid.");
  await db.order.update({
    where: { id: reserved.order.id },
    data: {
      status: "PENDING",
      snapToken: payload.token,
      redirectUrl: payload.redirect_url,
    },
  });
  return {
    token: payload.token,
    redirectUrl: payload.redirect_url,
    orderId: reserved.order.id,
  };
}
export async function processVerifiedStatus(verified: ProviderStatus) {
  const incoming = paymentState(verified);
  const eventKey = tokenHash(
    JSON.stringify([
      verified.transaction_id,
      verified.transaction_status,
      verified.status_code,
      verified.gross_amount,
      verified.fraud_status,
      verified.refund_amount,
    ]),
  );
  return serializable(async (tx) => {
    const order = await tx.order.findUnique({
      where: { orderNumber: verified.order_id },
      include: { purchases: { include: { template: true } }, user: true },
    });
    if (!order) throw new AppError(404, "Pesanan tidak ditemukan.");
    if (order.totalAmount !== amountInRupiah(verified.gross_amount))
      throw new AppError(400, "Jumlah pembayaran tidak sesuai pesanan.");
    if (
      order.providerReference &&
      order.providerReference !== verified.transaction_id
    )
      throw new AppError(400, "Referensi pembayaran tidak sesuai.");
    if (
      await tx.paymentEvent.findUnique({
        where: { providerEventKey: eventKey },
      })
    )
      return order.status;
    const next = nextPaymentState(order.status, incoming);
    await tx.paymentEvent.create({
      data: {
        orderId: order.id,
        providerEventKey: eventKey,
        payload: verified as Prisma.InputJsonValue,
        processedAt: new Date(),
      },
    });
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: next,
        providerReference: verified.transaction_id,
        paidAt: next === "PAID" ? order.paidAt || new Date() : order.paidAt,
        activePurchaseKey: [
          "FAILED",
          "CANCELLED",
          "EXPIRED",
          "REFUNDED",
          "CHARGEBACK",
        ].includes(next)
          ? null
          : order.activePurchaseKey,
      },
    });
    if (next === "PAID") {
      for (const item of order.purchases)
        await tx.userTemplate.upsert({
          where: {
            userId_templateId: {
              userId: order.userId,
              templateId: item.templateId,
            },
          },
          create: {
            userId: order.userId,
            templateId: item.templateId,
            sourceOrderId: order.id,
          },
          update: {},
        });
      await tx.emailJob.upsert({
        where: { key: `purchase:${order.id}` },
        create: {
          key: `purchase:${order.id}`,
          to: order.user.email,
          subject: "Pembelian berhasil",
          text: `${order.purchases.map((p) => p.template.name).join(", ")} kini menjadi milik Anda. Total ${money(order.totalAmount)}. Gunakan tanpa batas undangan:\n${appUrl()}/dashboard/my-templates`,
        },
        update: {},
      });
    }
    if (next === "REFUNDED" || next === "CHARGEBACK")
      await tx.userTemplate.deleteMany({ where: { sourceOrderId: order.id } });
    await tx.auditLog.create({
      data: {
        action: `PAYMENT_${next}`,
        entityType: "Order",
        entityId: order.id,
        metadata: {
          previous: order.status,
          providerStatus: verified.transaction_status,
        },
      },
    });
    return next;
  });
}
export async function paymentWebhook(input: unknown) {
  const notification = notificationSchema.parse(input);
  if (!verifySignature(notification, midtransKey()))
    throw new AppError(401, "Tanda tangan pembayaran tidak valid.");
  const verified = await transactionStatus(notification.order_id);
  if (verified.order_id !== notification.order_id)
    throw new AppError(400, "Pesanan pembayaran tidak sesuai.");
  return processVerifiedStatus(verified);
}
