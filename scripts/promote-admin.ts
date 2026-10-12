import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function run() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email)
    throw new Error("Gunakan: npm run admin:promote -- email-pengelola");
  const user = await db.user.findUnique({ where: { email } });
  if (!user?.emailVerified || user.disabledAt)
    throw new Error("Akun harus terdaftar, terverifikasi, dan aktif.");
  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { role: "ADMIN", sessionVersion: { increment: 1 } },
    });
    await tx.auditLog.create({
      data: {
        actorId: user.id,
        action: "ADMIN_PROMOTED_BY_OPERATOR",
        entityType: "User",
        entityId: user.id,
      },
    });
  });
  console.log("Peran admin diberikan. Masuk kembali untuk melanjutkan.");
}
run()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
