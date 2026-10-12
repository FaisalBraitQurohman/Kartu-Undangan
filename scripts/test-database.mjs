import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

if (!process.env.TEST_DATABASE_URL) {
  console.error(
    "TEST_DATABASE_URL wajib menunjuk database pengujian disposable.",
  );
  process.exit(1);
}
let url;
try {
  url = new URL(process.env.TEST_DATABASE_URL);
} catch {
  console.error("TEST_DATABASE_URL tidak valid.");
  process.exit(1);
}
if (!["postgres:", "postgresql:"].includes(url.protocol)) {
  console.error("Database pengujian harus PostgreSQL.");
  process.exit(1);
}
for (const [file, args] of [
  ["node_modules/vitest/vitest.mjs", ["run", "tests/integration"]],
  ["node_modules/@playwright/test/cli.js", ["test"]],
]) {
  const result = spawnSync(process.execPath, [resolve(file), ...args], {
    stdio: "inherit",
    env: { ...process.env, REQUIRE_DATABASE_TESTS: "true" },
    windowsHide: true,
  });
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}
