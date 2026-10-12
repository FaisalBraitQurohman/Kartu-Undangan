import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, readdir, readFile, unlink, rmdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { sendEmail, assertEmailConfigured } from "@/lib/email";

const resend = vi.hoisted(() => ({
  send: vi.fn().mockResolvedValue({ error: null }),
}));
vi.mock("resend", () => ({
  Resend: class {
    emails = resend;
  },
}));
let directory = "";
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "undangkita-mail-test-"));
  vi.stubEnv("LOCAL_MAIL_DIR", directory);
  vi.stubEnv("EMAIL_TRANSPORT", "local");
  vi.stubEnv("EMAIL_DELIVERY_ENABLED", "true");
  vi.stubEnv("VERCEL", "");
  resend.send.mockClear();
});
afterEach(async () => {
  for (const name of await readdir(directory))
    await unlink(join(directory, name));
  await rmdir(directory);
  vi.unstubAllEnvs();
});
describe("email transports", () => {
  it("persists a real local message without calling external services", async () => {
    await sendEmail(
      "fixture@example.test",
      "Verifikasi",
      "Tautan fixture lokal",
    );
    const files = await readdir(directory);
    expect(files).toHaveLength(1);
    expect(await readFile(join(directory, files[0]), "utf8")).toContain(
      "Tautan fixture lokal",
    );
    expect(resend.send).not.toHaveBeenCalled();
  });
  it("deduplicates outbox messages by idempotency key", async () => {
    await sendEmail(
      "fixture@example.test",
      "Pembelian",
      "Pesan",
      "fixture-key",
    );
    await sendEmail(
      "fixture@example.test",
      "Pembelian",
      "Pesan",
      "fixture-key",
    );
    expect(await readdir(directory)).toHaveLength(1);
  });
  it("rejects local delivery in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await expect(
      sendEmail("fixture@example.test", "Test", "Test"),
    ).rejects.toMatchObject({ status: 503 });
    expect(await readdir(directory)).toHaveLength(0);
  });
  it("rejects local delivery on hosted Vercel previews", () => {
    vi.stubEnv("VERCEL", "1");
    expect(assertEmailConfigured).toThrow();
  });
  it("rejects disabled or unknown transport configuration", () => {
    vi.stubEnv("EMAIL_DELIVERY_ENABLED", "false");
    expect(assertEmailConfigured).toThrow();
    vi.stubEnv("EMAIL_DELIVERY_ENABLED", "true");
    vi.stubEnv("EMAIL_TRANSPORT", "unknown");
    expect(assertEmailConfigured).toThrow();
  });
  it("uses the configured Resend adapter and idempotency key", async () => {
    vi.stubEnv("EMAIL_TRANSPORT", "resend");
    vi.stubEnv("RESEND_API_KEY", "fixture-not-a-real-key");
    vi.stubEnv("EMAIL_FROM", "fixture@example.test");
    await sendEmail("recipient@example.test", "Test", "Body", "test-key");
    expect(resend.send).toHaveBeenCalledWith(
      expect.objectContaining({ to: "recipient@example.test" }),
      { idempotencyKey: "test-key" },
    );
  });
});
