import { AuthScreen } from "@/components/auth-screen";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  return <AuthScreen mode="reset" token={(await searchParams).token} />;
}
