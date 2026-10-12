import { currentUser } from "@/lib/auth/guards";
import { redirect } from "next/navigation";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/login");
  return (
    <WorkspaceShell name={user.name} isAdmin={user.role === "ADMIN"}>
      {children}
    </WorkspaceShell>
  );
}
