import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { amountInRupiah, verifySignature } from "@/lib/payments/midtrans";
import { paymentState, nextPaymentState } from "@/features/payments/state";
describe("Pembayaran satu kali", () => {
  it.each([
    ["settlement", undefined, "PAID"],
    ["capture", "accept", "PAID"],
    ["capture", "deny", "FAILED"],
    ["capture", "challenge", "PENDING"],
    ["pending", undefined, "PENDING"],
    ["deny", undefined, "FAILED"],
    ["cancel", undefined, "CANCELLED"],
    ["expire", undefined, "EXPIRED"],
    ["refund", undefined, "REFUNDED"],
    ["chargeback", undefined, "CHARGEBACK"],
    ["partial_refund", undefined, "PAID"],
  ] as const)("maps %s/%s", (transaction_status, fraud_status, expected) =>
    expect(paymentState({ transaction_status, fraud_status })).toBe(expected),
  );
  it("does not downgrade paid orders on a delayed failure", () => {
    expect(nextPaymentState("PAID", "FAILED")).toBe("PAID");
    expect(nextPaymentState("PAID", "PENDING")).toBe("PAID");
    expect(nextPaymentState("PAID", "REFUNDED")).toBe("REFUNDED");
    expect(nextPaymentState("REFUNDED", "PAID")).toBe("REFUNDED");
  });
  it("uses exact integer rupiah without fractional rounding", () => {
    expect(amountInRupiah("49000.00")).toBe(49000);
    expect(amountInRupiah("49000")).toBe(49000);
    for (const v of ["1.01", "1e3", "-10", "NaN", "9007199254740992"])
      expect(() => amountInRupiah(v)).toThrow();
  });
  it("binds the signature to order, status code, amount and server key", () => {
    const key = "test-only-signature-key";
    const payload = {
      order_id: "test-order",
      status_code: "200",
      gross_amount: "49000.00",
      transaction_status: "settlement",
      signature_key: createHash("sha512")
        .update(`test-order20049000.00${key}`)
        .digest("hex"),
    };
    expect(verifySignature(payload, key)).toBe(true);
    expect(verifySignature({ ...payload, gross_amount: "1.00" }, key)).toBe(
      false,
    );
    expect(verifySignature(payload, "different")).toBe(false);
    expect(verifySignature({ ...payload, signature_key: "00" }, key)).toBe(
      false,
    );
  });
  it("rejects unknown provider states", () =>
    expect(() => paymentState({ transaction_status: "unknown" })).toThrow());
});
