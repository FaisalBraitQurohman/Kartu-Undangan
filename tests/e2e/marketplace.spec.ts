import { test, expect } from "@playwright/test";

test("editorial hero has one live template, early mobile actions and reduced motion", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toContainText("Lebih dari");
  await expect(page.locator("h1")).toContainText("Awal yang Indah.");
  await expect(
    page.locator(".editorial-showcase .marketplace-phone"),
  ).toHaveCount(1);
  await expect(
    page.locator(".editorial-showcase .invite-cover.ivory"),
  ).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator(".editorial-scene-image")
        .evaluate(
          (image) =>
            (image as HTMLImageElement).complete &&
            (image as HTMLImageElement).naturalWidth > 0,
        ),
    )
    .toBe(true);
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const lines = await page
      .locator(".editorial-heading span")
      .evaluateAll((nodes) =>
        nodes.map((node) => ({
          width: node.getBoundingClientRect().width,
          textWidth: node.scrollWidth,
        })),
      );
    expect(lines.every((line) => line.textWidth <= line.width + 1)).toBe(true);
    if (width <= 390) {
      const action = await page
        .locator(".editorial-actions a")
        .first()
        .boundingBox();
      expect(action!.y + action!.height).toBeLessThan(844);
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".editorial-phone-link")).toHaveCSS(
    "transition-duration",
    "0s",
  );
  await page
    .getByRole("link", {
      name: "Lihat demo undangan Minimalist Ivory",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/\/demo\/minimalist-ivory$/);
});

test("catalog searches real templates, combines filters and previews the chosen accent", async ({
  page,
}) => {
  test.skip(
    !process.env.TEST_DATABASE_URL,
    "Catalog requires a seeded test database.",
  );
  await page.goto("/");
  const cards = page.locator(".marketplace-card");
  await expect(cards).toHaveCount(4);
  await page.getByRole("searchbox", { name: "Cari template" }).fill("Royal");
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText("Royal Elegant");
  await page
    .getByRole("searchbox", { name: "Cari template" })
    .fill("desain-tidak-tersedia");
  await expect(
    page.getByRole("heading", {
      name: "Desain yang kamu cari belum ditemukan.",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Tampilkan semua template" }).click();
  await page.getByRole("button", { name: "Floral", exact: true }).click();
  await expect(cards).toHaveCount(2);
  await page.getByLabel("Filter warna", { exact: true }).selectOption("Gold");
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText("Emerald Garden");
  await page.getByRole("button", { name: "Reset filter" }).click();
  await page.getByLabel("Filter harga", { exact: true }).selectOption("free");
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText("Minimalist Ivory");
  await page
    .getByRole("button", { name: "Minimalist Ivory: Sage", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Minimalist Ivory: Sage", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("link", { name: "Preview Minimalist Ivory", exact: true })
    .click();
  await expect(page).toHaveURL(/\/demo\/minimalist-ivory\?accent=%2382917b/);
  await expect(page.locator(".invitation-page")).toHaveAttribute(
    "style",
    /--ring: #82917b/,
  );
});

test("editor showcase updates live and mobile navigation works without overflow", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Nama mempelai", { exact: true }).fill("Nadia");
  await page.getByLabel("Nama pasangan", { exact: true }).fill("Arga");
  await expect(page.locator(".editor-preview .invite-cover h2")).toContainText(
    "Nadia",
  );
  await expect(page.locator(".editor-preview .invite-cover h2")).toContainText(
    "Arga",
  );
  await page.getByRole("button", { name: "Editor: Espresso" }).click();
  await expect(
    page.locator(".editor-preview .marketplace-phone"),
  ).toHaveAttribute("style", /--preview-accent: #3b302b/);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Buka menu" }).click();
  await page
    .getByRole("navigation", { name: "Navigasi seluler" })
    .getByRole("link", { name: "Template", exact: true })
    .click();
  await expect(page).toHaveURL(/\/templates$/);
  await expect(
    page.getByRole("navigation", { name: "Navigasi seluler" }),
  ).toHaveCount(0);
});
