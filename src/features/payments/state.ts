import type { OrderStatus } from "@prisma/client";
import type { ProviderStatus } from "@/lib/payments/midtrans";
import { AppError } from "@/lib/security/errors";
export function paymentState(
  provider: Pick<ProviderStatus, "transaction_status" | "fraud_status">,
): OrderStatus {
  switch (provider.transaction_status) {
    case "settlement":
      return "PAID";
    case "capture":
      return provider.fraud_status === "accept"
        ? "PAID"
        : provider.fraud_status === "deny"
          ? "FAILED"
          : "PENDING";
    case "pending":
      return "PENDING";
    case "deny":
    case "failure":
      return "FAILED";
    case "cancel":
      return "CANCELLED";
    case "expire":
      return "EXPIRED";
    case "refund":
      return "REFUNDED";
    case "chargeback":
      return "CHARGEBACK";
    case "partial_refund":
    case "partial_chargeback":
      return "PAID";
    default:
      throw new AppError(422, "Status pembayaran belum didukung.");
  }
}
export function nextPaymentState(
  current: OrderStatus,
  incoming: OrderStatus,
): OrderStatus {
  if (current === "REFUNDED" || current === "CHARGEBACK") return current;
  if (current === "PAID" && !["REFUNDED", "CHARGEBACK"].includes(incoming))
    return current;
  return incoming;
}
