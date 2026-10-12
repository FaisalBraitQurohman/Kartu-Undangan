import { PrismaClient, Prisma } from "@prisma/client";
import { z } from "zod";
import { contentSchema } from "../src/validators/invitation";
import { registry, templateKeys } from "../src/templates/registry";
const db = new PrismaClient();
async function seed() {
  const samplePrices = [0, 49_000, 79_000, 99_000];
  for (const [index, key] of templateKeys.entries()) {
    await db.template.upsert({
      where: { key },
      create: {
        key,
        slug: key,
        name: registry[key].name,
        description: registry[key].subtitle,
        category: "WEDDING",
        price: samplePrices[index],
        isFree: index === 0,
        version: 1,
        thumbnailUrl: `/previews/${key}.svg`,
        previewImages: [`/previews/${key}.svg`],
        configSchema: z.toJSONSchema(contentSchema) as Prisma.InputJsonValue,
      },
      update: {},
    });
  }
  console.log(
    "Empat template awal tersedia. Harga yang sudah diedit tidak diubah.",
  );
}
seed()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Seed gagal.");
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
