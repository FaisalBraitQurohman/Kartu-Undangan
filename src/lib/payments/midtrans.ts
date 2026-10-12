import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { AppError } from "@/lib/security/errors";
export const notificationSchema = z.object({
  order_id: z.string().max(100),
  status_code: z.string().regex(/^\d{3}$/),
  gross_amount: z.string().regex(/^\d+(?:\.00)?$/),
  signature_key: z.string().regex(/^[a-f0-9]{128}$/i),
  transaction_status: z.string(),
  fraud_status: z.string().optional(),
  transaction_id: z.string().optional(),
});
export const statusSchema = notificationSchema
  .omit({ signature_key: true })
  .extend({
    transaction_id: z.string(),
    currency: z.literal("IDR").optional(),
    refund_amount: z.string().optional(),
  });
export type ProviderStatus = z.infer<typeof statusSchema>;
export function amountInRupiah(amount: string) {
  if (!/^\d+(?:\.00)?$/.test(amount))
    throw new AppError(400, "Jumlah pembayaran tidak valid.");
  const value = BigInt(amount.split(".")[0]);
  if (value > BigInt(Number.MAX_SAFE_INTEGER))
    throw new AppError(400, "Jumlah pembayaran terlalu besar.");
  return Number(value);
}
export function verifySignature(
  payload: z.infer<typeof notificationSchema>,
  key: string,
) {
  const expected = createHash("sha512")
    .update(
      `${payload.order_id}${payload.status_code}${payload.gross_amount}${key}`,
    )
    .digest();
  const actual = Buffer.from(payload.signature_key, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export function midtransKey() {
  if (!process.env.MIDTRANS_SERVER_KEY)
    throw new AppError(503, "Pembayaran belum dikonfigurasi.");
  return process.env.MIDTRANS_SERVER_KEY;
}
export function midtransHeaders() {
  return {
    Authorization: `Basic ${Buffer.from(`${midtransKey()}:`).toString("base64")}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}
export async function transactionStatus(
  orderNumber: string,
): Promise<ProviderStatus> {
  const base =
    process.env.MIDTRANS_IS_PRODUCTION === "true"
      ? "https://api.midtrans.com"
      : "https://api.sandbox.midtrans.com";
  const res = await fetch(
    `${base}/v2/${encodeURIComponent(orderNumber)}/status`,
    {
      headers: midtransHeaders(),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    },
  );
  if (!res.ok)
    throw new AppError(503, "Status pembayaran belum dapat diverifikasi.");
  return statusSchema.parse(await res.json());
}
