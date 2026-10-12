import { AuthScreen } from "@/components/auth-screen";
export const metadata = { title: "Lupa kata sandi" };
export default function Page() {
  return <AuthScreen mode="forgot" />;
}
