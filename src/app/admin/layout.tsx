import { currentUser } from "@/lib/auth/guards";
import { redirect, notFound } from "next/navigation";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") notFound();
  return (
    <WorkspaceShell name={user.name} admin isAdmin>
      {children}
    </WorkspaceShell>
  );
}
