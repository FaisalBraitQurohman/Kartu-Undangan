import { describe, expect, it, vi, afterEach } from "vitest";
import { requireSameOrigin, readJson } from "@/lib/security/request";
import { rateLimit } from "@/lib/security/rate-limit";
import { secureToken, tokenHash } from "@/lib/security/tokens";
import { mediaKind } from "@/lib/storage/cloudinary";
import { csvCell } from "@/features/guests/service";
import { registerSchema } from "@/validators/auth";
import { contentSchema, defaultContent } from "@/validators/invitation";
import { rendererSupported } from "@/templates/registry";
import { guestSchema } from "@/validators/guest";
import { telemetryUrl } from "@/lib/security/telemetry";
afterEach(() => vi.unstubAllEnvs());
describe("Batas keamanan", () => {
  it("removes guest and reset tokens from telemetry URLs", () => {
    expect(telemetryUrl("https://example.test/i/alya?to=secret#token")).toBe(
      "https://example.test/i/alya",
    );
    expect(telemetryUrl("/reset-password?token=secret")).toBe(
      "/reset-password",
    );
  });
  it("normalizes Indonesian numbers for WhatsApp and guards whitespace-prefixed CSV formulas", () => {
    expect(
      guestSchema.parse({ name: "Alya", phone: "0812 3456 789" }).phone,
    ).toBe("+628123456789");
    expect(csvCell("  =SUM(A1)")).toBe('"\'  =SUM(A1)"');
  });
  it("requires exact same-origin for mutation requests", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://undangkita.test");
    expect(() =>
      requireSameOrigin(
        new Request("https://undangkita.test/api", {
          headers: { origin: "https://evil.test" },
        }),
      ),
    ).toThrow();
    expect(() =>
      requireSameOrigin(new Request("https://undangkita.test/api")),
    ).toThrow();
    expect(() =>
      requireSameOrigin(
        new Request("https://undangkita.test/api", {
          headers: { origin: "https://undangkita.test" },
        }),
      ),
    ).not.toThrow();
  });
  it("rejects oversized or invalid JSON", async () => {
    await expect(
      readJson(
        new Request("http://localhost", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "not-json",
        }),
      ),
    ).rejects.toThrow();
    await expect(
      readJson(
        new Request("http://localhost", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify("x".repeat(100001)),
        }),
      ),
    ).rejects.toThrow();
  });
  it("limits actual requests and fails closed in production without Redis", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    const key = secureToken();
    await rateLimit(key, 2);
    await rateLimit(key, 2);
    await expect(rateLimit(key, 2)).rejects.toMatchObject({ status: 429 });
    vi.stubEnv("NODE_ENV", "production");
    await expect(rateLimit(secureToken())).rejects.toMatchObject({
      status: 503,
    });
  });
  it("uses unguessable tokens and nonreversible reset hashes", () => {
    const token = secureToken();
    expect(token).toMatch(/^[a-f0-9]{64}$/);
    expect(secureToken()).not.toBe(token);
    expect(tokenHash(token)).not.toBe(token);
  });
  it("validates bytes rather than trusting a file's claimed type", () => {
    expect(mediaKind(Buffer.from([255, 216, 255, 0]), "image/jpeg")).toBe(
      "IMAGE",
    );
    expect(() =>
      mediaKind(Buffer.from("<script>alert(1)</script>"), "image/jpeg"),
    ).toThrow();
    expect(() => mediaKind(Buffer.from("<svg/>"), "image/svg+xml")).toThrow();
  });
  it("neutralizes CSV spreadsheet formulas and quotes", () => {
    expect(csvCell("=1+1")).toBe('"\'=1+1"');
    expect(csvCell('a"b')).toBe('"a""b"');
  });
  it("requires sufficiently long passwords and bounded UTF-8 bcrypt inputs", () => {
    expect(
      registerSchema.safeParse({
        name: "Alya",
        email: "a@example.test",
        password: "short",
      }).success,
    ).toBe(false);
    expect(
      registerSchema.safeParse({
        name: "Alya",
        email: "a@example.test",
        password: "😀".repeat(30),
      }).success,
    ).toBe(false);
  });
  it("only supports controlled versioned JSON renderers", () => {
    expect(contentSchema.safeParse(defaultContent).success).toBe(true);
    expect(rendererSupported("minimalist-ivory", 1)).toBe(true);
    expect(rendererSupported("malicious-js", 1)).toBe(false);
    expect(rendererSupported("royal-elegant", 99)).toBe(false);
  });
});
