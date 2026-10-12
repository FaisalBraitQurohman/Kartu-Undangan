import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { hash } from "bcryptjs";
import { readdir, readFile, unlink, rmdir } from "node:fs/promises";
import { resolve, sep } from "node:path";
const hasDb = !!process.env.TEST_DATABASE_URL;
const db = new PrismaClient();
const prefix = `browser-${randomBytes(6).toString("hex")}`;
const password = randomBytes(24).toString("hex");
const users: { id: string; email: string }[] = [];
let privateId = "",
  freeId = "";
test.beforeAll(async () => {
  if (!hasDb) return;
  const passwordHash = await hash(password, 12);
  for (const suffix of ["a", "b", "admin"]) {
    users.push(
      await db.user.create({
        data: {
          name: `${prefix}-${suffix}`,
          email: `${prefix}-${suffix}@example.test`,
          passwordHash,
          emailVerified: new Date(),
          role: suffix === "admin" ? "ADMIN" : "USER",
        },
        select: { id: true, email: true },
      }),
    );
  }
  const template = await db.template.findUniqueOrThrow({
    where: { key: "minimalist-ivory" },
  });
  freeId = template.id;
  privateId = (
    await db.invitation.create({
      data: {
        userId: users[0].id,
        templateId: freeId,
        slug: `${prefix}-private`,
        title: "Draf pribadi",
        content: {},
        settings: {},
      },
    })
  ).id;
});
test.afterAll(async () => {
  if (hasDb) {
    const ids = users.map((u) => u.id);
    const registered = await db.user.findMany({
      where: { email: { startsWith: prefix } },
      select: { id: true },
    });
    const all = [...ids, ...registered.map((u) => u.id)];
    await db.auditLog.deleteMany({ where: { actorId: { in: all } } });
    await db.userTemplate.deleteMany({ where: { userId: { in: all } } });
    await db.emailJob.deleteMany({ where: { to: { startsWith: prefix } } });
    await db.invitation.deleteMany({ where: { userId: { in: all } } });
    await db.verificationToken.deleteMany({
      where: { identifier: { startsWith: prefix } },
    });
    await db.user.deleteMany({ where: { id: { in: all } } });
  }
  await db.$disconnect();
  const directory = process.env.LOCAL_MAIL_DIR;
  if (directory && resolve(directory).startsWith(resolve(".local") + sep)) {
    try {
      for (const name of await readdir(directory))
        await unlink(resolve(directory, name));
      await rmdir(directory);
    } catch (error) {
      if (!(
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      ))
        throw error;
    }
  }
});
async function login(page: Page, index = 0) {
  await page.goto("/login");
  await page.getByLabel("Alamat email").fill(users[index].email);
  await page.getByLabel("Kata sandi", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}
test("marketing, FAQ and four distinct template demos", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Setiap Momen Indah, Layak Dikenang." }),
  ).toBeVisible();
  await page
    .getByRole("main")
    .locator("summary")
    .filter({ hasText: "Apakah template hanya dibeli sekali?" })
    .click();
  await expect(
    page.getByText("Ya. Setiap template premium cukup dibeli sekali", {
      exact: false,
    }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/home-desktop.png",
    fullPage: true,
  });
  for (const key of [
    "minimalist-ivory",
    "royal-elegant",
    "romantic-bloom",
    "emerald-garden",
  ]) {
    await page.goto(`/demo/${key}`);
    await expect(
      page.getByText("Demo undangan dengan data contoh.", { exact: false }),
    ).toBeVisible();
    await expect(page.locator(".invite-cover")).toBeVisible();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Setiap Momen Indah, Layak Dikenang." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Buka menu", exact: true }).click();
  await expect(
    page.getByRole("navigation", { name: "Navigasi seluler" }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/home-mobile.png",
    fullPage: true,
  });
});
test("protected pages require login and invalid credentials fail", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  test.skip(!hasDb, "Requires TEST_DATABASE_URL");
  await page.getByLabel("Alamat email").fill(users[0].email);
  await page
    .getByLabel("Kata sandi", { exact: true })
    .fill("not-the-correct-password");
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page.locator("p[role=alert]")).toContainText(
    "Email atau kata sandi salah",
  );
});
test("invitation editor, publication, guest RSVP and moderation", async ({
  page,
}) => {
  test.skip(!hasDb, "Requires TEST_DATABASE_URL");
  await login(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Buka menu dashboard" }).click();
  await expect(
    page.getByRole("dialog", { name: "Menu dashboard" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Menu dashboard" }),
  ).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Buka menu dashboard" }),
  ).toBeFocused();
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(`/dashboard/invitations/new?template=${freeId}`);
  await page.getByLabel("Judul undangan").fill("Pernikahan browser QA");
  await page.getByLabel("Tautan undangan").fill(`${prefix}-public`);
  await page.getByRole("button", { name: "Buat draf undangan" }).click();
  await expect(page).toHaveURL(/\/edit$/);
  const id = page.url().match(/invitations\/([^/]+)\/edit/)![1];
  await page
    .getByRole("button", { name: "Identitas pasangan", exact: true })
    .click();
  await page.getByLabel("Nama panggilan mempelai pertama").fill("Alya");
  await page.getByLabel("Nama panggilan mempelai kedua").fill("Rizky");
  await page.getByRole("button", { name: "Detail acara", exact: true }).click();
  await page.getByRole("button", { name: "Tambah acara" }).click();
  await page.getByLabel("Mulai", { exact: true }).fill("2027-06-12T10:00");
  await page.getByLabel("Nama tempat").fill("Taman Senja");
  await page.getByLabel("Alamat lengkap").fill("Bandung, Jawa Barat");
  await page.getByRole("button", { name: "Publikasikan", exact: true }).click();
  await expect(
    page.getByText("Undangan tersimpan dan terpublikasi.", { exact: true }),
  ).toBeVisible();
  await page.goto(`/dashboard/invitations/${id}/guests`);
  await page.getByLabel("Nama tamu").fill("Tamu browser QA");
  await page.getByRole("button", { name: "Tambah tamu", exact: true }).click();
  await expect(
    page.getByRole("cell", { name: "Tamu browser QA", exact: true }),
  ).toBeVisible();
  const guest = await db.guest.findFirstOrThrow({
    where: { invitationId: id },
  });
  await page.goto(`/i/${prefix}-public?to=${guest.token}`);
  await expect(
    page.getByRole("main").getByText("Tamu browser QA", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Buka undangan" }).click();
  await page.getByLabel(/Jumlah orang/).fill("2");
  await page.getByRole("button", { name: "Kirim konfirmasi" }).click();
  await expect(
    page.getByText("Terima kasih, konfirmasi tersimpan.", { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Tulis ucapanmu")
    .fill("Selamat berbahagia dari browser QA");
  await page.getByRole("button", { name: "Kirim ucapan" }).click();
  await expect(
    page.getByText("Ucapan tersimpan dan menunggu tinjauan."),
  ).toBeVisible();
  await page.goto(`/dashboard/invitations/${id}/wishes`);
  await page.getByRole("button", { name: "Tampilkan", exact: true }).click();
  await expect(page.getByText("Ditampilkan", { exact: true })).toBeVisible();
  await page.goto(`/dashboard/invitations/${id}/edit`);
  await page.getByRole("button", { name: "Publikasi", exact: true }).click();
  await page.getByRole("button", { name: "Batalkan publikasi" }).click();
  await expect(
    page.getByText("Draf undangan tersimpan.", { exact: true }),
  ).toBeVisible();
  const response = await page.goto(`/i/${prefix}-public`);
  expect(response?.status()).toBe(404);
  await page.goto("/dashboard/invitations");
  const card = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "Pernikahan browser QA" }),
  });
  await card.getByRole("button", { name: "Hapus", exact: true }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Lanjutkan" })
    .click();
  await expect(
    page.getByText("Undangan dihapus.", { exact: true }),
  ).toBeVisible();
  expect(await db.invitation.findUnique({ where: { id } })).toBeNull();
});
test("cross-user isolation and admin authorization are enforced in APIs", async ({
  page,
}) => {
  test.skip(!hasDb, "Requires TEST_DATABASE_URL");
  await login(page, 1);
  expect(
    (await page.request.get(`/api/manage/invitations/${privateId}`)).status(),
  ).toBe(404);
  expect(
    (
      await page.request.post(`/api/manage/invitations/${privateId}/guests`, {
        headers: { origin: "http://localhost:3100" },
        data: { name: "Intruder" },
      })
    ).status(),
  ).toBe(404);
  expect(
    (
      await page.request.patch(`/api/manage/admin/users/${users[0].id}`, {
        headers: { origin: "http://localhost:3100" },
        data: { role: "ADMIN", disabled: false },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await page.request.post("/api/manage/checkout", {
        headers: { origin: "https://evil.test" },
        data: { templateId: freeId },
      })
    ).status(),
  ).toBe(403);
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Halaman tidak ditemukan." }),
  ).toBeVisible();
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Keluar", exact: true }).click();
  await expect(page).toHaveURL("http://localhost:3100/");
  const session = await page.request.get("/api/auth/session");
  expect((await session.json()).user).toBeUndefined();
});
test("admin template management persists authoritative prices", async ({
  page,
}) => {
  test.skip(!hasDb, "Requires TEST_DATABASE_URL");
  await login(page, 2);
  await page.goto("/admin/templates");
  const template = await db.template.findUniqueOrThrow({
    where: { key: "royal-elegant" },
  });
  await page.goto(`/admin/templates/${template.id}/edit`);
  try {
    await page.getByLabel("Harga (rupiah)").fill(String(template.price + 1000));
    await page.getByRole("button", { name: "Simpan template" }).click();
    await expect(page).toHaveURL(/\/admin\/templates$/);
    expect(
      (await db.template.findUniqueOrThrow({ where: { id: template.id } }))
        .price,
    ).toBe(template.price + 1000);
  } finally {
    await db.template.update({
      where: { id: template.id },
      data: { price: template.price },
    });
  }
  for (const route of [
    "users",
    "invitations",
    "orders",
    "payments",
    "wishes",
    "audit-logs",
    "settings",
  ]) {
    const response = await page.goto(`/admin/${route}`);
    expect(response?.status()).toBe(200);
  }
});

test("registration, local verification mail and password reset revoke old sessions", async ({
  page,
}) => {
  test.skip(!hasDb, "Requires TEST_DATABASE_URL");
  const email = `${prefix}-registration@example.test`;
  const newPassword = randomBytes(24).toString("hex");
  const loginAccount = async (value: string) => {
    await page.goto("/login");
    await page.getByLabel("Alamat email").fill(email);
    await page.getByLabel("Kata sandi", { exact: true }).fill(value);
    await page.getByRole("button", { name: "Masuk", exact: true }).click();
  };
  const mailLink = async (route: string) => {
    const directory = process.env.LOCAL_MAIL_DIR!;
    const files = await readdir(directory);
    for (const file of files) {
      const body = await readFile(resolve(directory, file), "utf8");
      if (!body.includes(`Kepada: ${email}\n`)) continue;
      const link = body.match(
        new RegExp(`http://localhost:3100/${route}\\?token=[a-f0-9]{64}`),
      );
      if (link) return link[0];
    }
    throw new Error("Email fixture belum ditemukan di inbox lokal.");
  };
  await page.goto("/register");
  await page.getByLabel("Nama lengkap").fill("Pengguna lokal");
  await page.getByLabel("Alamat email").fill(email);
  await page.getByLabel("Kata sandi", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Buat akun", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Akun dibuat");
  await loginAccount(password);
  await expect(page.getByRole("alert")).toContainText("belum terverifikasi");
  await page.goto(await mailLink("verify-email"));
  await page
    .getByRole("button", { name: "Verifikasi email", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("berhasil");
  await loginAccount(password);
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/forgot-password");
  await page.getByLabel("Alamat email").fill(email);
  await page.getByRole("button", { name: "Kirim tautan", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Jika email terdaftar");
  await page.goto(await mailLink("reset-password"));
  await page.getByLabel("Kata sandi", { exact: true }).fill(newPassword);
  await page
    .getByRole("button", { name: "Simpan kata sandi", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("berhasil");
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
  await loginAccount(password);
  await expect(page.getByRole("alert")).toBeVisible();
  await loginAccount(newPassword);
  await expect(page).toHaveURL(/\/dashboard$/);
});
