import { getServerSession } from "next-auth";
import { authOptions } from "./options";
import { db } from "@/lib/db";
import { AppError } from "@/lib/security/errors";
import { cache } from "react";
import { redirect, notFound } from "next/navigation";
export const currentUser = cache(async function currentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      sessionVersion: true,
      disabledAt: true,
    },
  });
  if (
    !user ||
    user.disabledAt ||
    !user.emailVerified ||
    user.sessionVersion !== session.user.sessionVersion
  )
    return null;
  return user;
});
export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new AppError(401, "Silakan masuk terlebih dahulu.");
  return user;
}
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN")
    throw new AppError(403, "Akses hanya untuk admin.");
  return user;
}
export async function pageUser() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}
export async function pageAdmin() {
  const user = await pageUser();
  if (user.role !== "ADMIN") notFound();
  return user;
}
