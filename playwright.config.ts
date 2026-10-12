import { defineConfig, devices } from "@playwright/test";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
const origin = "http://localhost:3100";
const mailDirectory = resolve(
  ".local",
  `browser-mail-${randomBytes(8).toString("hex")}`,
);
process.env.LOCAL_MAIL_DIR = mailDirectory;
if (
  process.env.REQUIRE_DATABASE_TESTS === "true" &&
  !process.env.TEST_DATABASE_URL
)
  throw new Error(
    "Browser suites require TEST_DATABASE_URL; skipping is forbidden.",
  );
if (process.env.TEST_DATABASE_URL)
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: "list",
  use: {
    baseURL: origin,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
    url: origin,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL || "",
      AUTH_SECRET: randomBytes(32).toString("hex"),
      NEXTAUTH_URL: origin,
      NEXT_PUBLIC_APP_URL: origin,
      EMAIL_DELIVERY_ENABLED: "true",
      EMAIL_TRANSPORT: "local",
      LOCAL_MAIL_DIR: mailDirectory,
      RESEND_API_KEY: "",
      SENTRY_DSN: "",
      NEXT_PUBLIC_SENTRY_DSN: "",
      MIDTRANS_SERVER_KEY: "",
      MIDTRANS_IS_PRODUCTION: "false",
      UPSTASH_REDIS_REST_URL: "",
      UPSTASH_REDIS_REST_TOKEN: "",
    },
  },
});
