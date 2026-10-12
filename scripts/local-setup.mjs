import { access, mkdir, writeFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import net from "node:net";

const root = process.cwd();
const statePath = resolve(root, ".local/service.json");
const cli = resolve(root, "node_modules/prisma/build/index.js");
const exists = async (file) => {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
};

async function run(file, args, env = process.env) {
  await new Promise((yes, no) => {
    const child = spawn(process.execPath, [file, ...args], {
      env,
      windowsHide: true,
      stdio: ["ignore", "ignore", "ignore"],
    });
    child.once("error", () =>
      no(
        new Error(
          "Proses setup gagal dimulai. Periksa instalasi Node dan npm ci.",
        ),
      ),
    );
    child.once("exit", (code) =>
      code === 0
        ? yes()
        : no(
            new Error(
              "Proses setup gagal. Periksa status Prisma local dan ketersediaan port; konfigurasi lama tidak ditimpa.",
            ),
          ),
    );
  });
}

async function isPortFree(port) {
  return new Promise((done) => {
    const server = net.createServer();
    server.once("error", () => done(false));
    server.listen(port, "127.0.0.1", () => server.close(() => done(true)));
  });
}

async function main() {
  if (!(await exists(cli))) throw new Error("Jalankan npm ci terlebih dahulu.");
  if (process.argv.includes("--stop") || process.argv.includes("--start")) {
    if (!(await exists(statePath)))
      throw new Error(
        "Belum ada database lokal yang dibuat oleh local:setup di folder ini.",
      );
    const state = JSON.parse(await readFile(statePath, "utf8"));
    if (!/^undangkita-local(?:-[a-z0-9]+)?$/.test(state.name))
      throw new Error("Metadata database lokal tidak valid.");
    const action = process.argv.includes("--stop") ? "stop" : "start";
    await run(cli, ["dev", action, state.name]);
    console.log(
      `Database lokal ${action === "stop" ? "dihentikan" : "dimulai"}. Data tetap tersimpan.`,
    );
    return;
  }
  if (
    (await exists(resolve(root, ".env"))) ||
    (await exists(resolve(root, ".env.local")))
  )
    throw new Error(
      "Konfigurasi environment sudah ada dan tidak ditimpa. Gunakan README untuk setup manual, atau local:db untuk memulai database yang sudah dibuat.",
    );
  const dbPort = Number(process.env.LOCAL_DB_PORT || 51421);
  const name = process.env.LOCAL_DATABASE_NAME || "undangkita-local";
  if (
    !Number.isInteger(dbPort) ||
    dbPort < 1025 ||
    dbPort > 65534 ||
    !/^undangkita-local(?:-[a-z0-9]+)?$/.test(name)
  )
    throw new Error("Nama/port database lokal tidak valid.");
  for (const port of [dbPort - 1, dbPort, dbPort + 1]) {
    if (!(await isPortFree(port)))
      throw new Error(
        `Port ${port} sedang digunakan. Pilih LOCAL_DB_PORT lain atau gunakan database lokal yang sudah dibuat.`,
      );
  }
  console.log("Menyiapkan Prisma Postgres lokal untuk development...");
  await run(cli, [
    "dev",
    "--name",
    name,
    "--port",
    String(dbPort - 1),
    "--db-port",
    String(dbPort),
    "--shadow-db-port",
    String(dbPort + 1),
    "--detach",
  ]);
  await mkdir(resolve(root, ".local"), { recursive: true });
  await writeFile(statePath, JSON.stringify({ name, dbPort }) + "\n", {
    flag: "wx",
    mode: 0o600,
  });
  // This connection belongs to Prisma's loopback-only development server.
  // It is never used for deployment or a production database.
  const databaseUrl = `postgres://postgres:postgres@localhost:${dbPort}/template1?sslmode=disable&connection_limit=1&statement_cache_size=0&pgbouncer=true&connect_timeout=10`;
  const env = { ...process.env, DATABASE_URL: databaseUrl };
  console.log("Menerapkan migrasi dan empat template awal...");
  await run(cli, ["migrate", "deploy"], env);
  await run(
    resolve(root, "node_modules/tsx/dist/cli.mjs"),
    ["prisma/seed.ts"],
    env,
  );
  await writeFile(
    resolve(root, ".env.local"),
    [
      "# Generated development configuration; never commit or deploy this file.",
      `DATABASE_URL=${databaseUrl}`,
      `AUTH_SECRET=${randomBytes(32).toString("hex")}`,
      "NEXTAUTH_URL=http://localhost:3000",
      "NEXT_PUBLIC_APP_URL=http://localhost:3000",
      "EMAIL_DELIVERY_ENABLED=true",
      "EMAIL_TRANSPORT=local",
      "LOCAL_MAIL_DIR=.local/mail",
      "MIDTRANS_IS_PRODUCTION=false",
      "NEXT_TELEMETRY_DISABLED=1",
      "",
    ].join("\n"),
    { flag: "wx", mode: 0o600 },
  );
  console.log(
    "Setup lokal selesai. Jalankan npm run dev, lalu buka http://localhost:3000.",
  );
  console.log(
    "Daftar akun Anda sendiri. Email verifikasi disimpan di .local/mail; lihat npm run local:inbox.",
  );
  console.log(
    "Untuk sesi berikutnya: npm run local:db. Untuk menghentikan database: npm run local:stop.",
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
