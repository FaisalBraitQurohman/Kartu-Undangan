"use client";
import { useHydrated } from "@/hooks/use-hydrated";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  registerSchema,
  loginSchema,
  emailSchema,
  passwordSchema,
} from "@/validators/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { apiRequest } from "@/lib/api-client";
import { Flower2 } from "lucide-react";
export type AuthMode =
  "login" | "register" | "forgot" | "reset" | "verify" | "resend";
const labels: Record<AuthMode, [string, string, string]> = {
  login: [
    "Selamat datang kembali.",
    "Cerita indahmu menunggu untuk dilanjutkan.",
    "Masuk",
  ],
  register: [
    "Mulai cerita indahmu.",
    "Buat akun gratis dan undangan pertama yang terasa personal.",
    "Buat akun",
  ],
  forgot: [
    "Lupa kata sandi?",
    "Kami akan mengirim tautan untuk mengatur kata sandi baru.",
    "Kirim tautan",
  ],
  reset: [
    "Kata sandi baru.",
    "Gunakan minimal 12 karakter yang sulit ditebak.",
    "Simpan kata sandi",
  ],
  verify: [
    "Aktifkan akunmu.",
    "Konfirmasi alamat email untuk mulai membuat undangan.",
    "Verifikasi email",
  ],
  resend: [
    "Kirim ulang verifikasi.",
    "Masukkan email akun yang ingin diaktifkan.",
    "Kirim verifikasi",
  ],
};
export function AuthScreen({
  mode,
  token = "",
}: {
  mode: AuthMode;
  token?: string;
}) {
  const ready = useHydrated();

  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const schema = z
    .object({ name: z.string(), email: z.string(), password: z.string() })
    .superRefine((data, ctx) => {
      const result =
        mode === "register"
          ? registerSchema.safeParse(data)
          : mode === "login"
            ? loginSchema.safeParse(data)
            : mode === "reset"
              ? passwordSchema.safeParse(data.password)
              : mode === "verify"
                ? null
                : emailSchema.safeParse(data.email);
      if (result && !result.success)
        for (const issue of result.error.issues)
          ctx.addIssue({
            code: "custom",
            path: issue.path.length
              ? issue.path
              : [mode === "reset" ? "password" : "email"],
            message: issue.message,
          });
    });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });
  const submit = form.handleSubmit(async (data) => {
    setError("");
    setMessage("");
    try {
      if (mode === "login") {
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
          callbackUrl: "/dashboard",
        });
        if (result?.error)
          throw new Error(
            "Email atau kata sandi salah, atau akun belum terverifikasi.",
          );
        router.push("/dashboard");
        router.refresh();
      } else {
        const result = await apiRequest(`/api/access/${mode}`, "POST", {
          ...data,
          token,
        });
        setMessage(result.message);
        if (mode === "reset") form.reset();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Layanan tidak tersedia.");
    }
  });
  return (
    <main id="main" className="grid min-h-screen md:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-secondary p-14 md:flex">
        <Link href="/" className="flex items-center gap-2 font-serif text-2xl">
          <Flower2 />
          UndangKita
        </Link>
        <div>
          <h2 className="display max-w-lg text-6xl">
            Cerita yang indah,
            <br />
            dimulai dari sini.
          </h2>
          <p className="mt-8 max-w-sm text-sm leading-8 text-muted-foreground">
            Satu template. Beribu kemungkinan. Rayakan setiap momen dengan
            caramu sendiri.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Sekali beli, gunakan selamanya.
        </p>
      </aside>
      <section className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-md">
          <Link
            className="mb-10 inline-block font-serif text-2xl md:hidden"
            href="/"
          >
            UndangKita
          </Link>
          <h1 className="display text-4xl">{labels[mode][0]}</h1>
          <p className="mb-8 mt-4 text-sm leading-7 text-muted-foreground">
            {labels[mode][1]}
          </p>
          <form noValidate onSubmit={submit} className="grid gap-5">
            <fieldset disabled={!ready} className="contents">
              {mode === "register" && (
                <Field
                  label="Nama lengkap"
                  error={form.formState.errors.name?.message}
                >
                  <Input {...form.register("name")} autoComplete="name" />
                </Field>
              )}
              {["login", "register", "forgot", "resend"].includes(mode) && (
                <Field
                  label="Alamat email"
                  error={form.formState.errors.email?.message}
                >
                  <Input
                    {...form.register("email")}
                    type="email"
                    autoComplete="email"
                  />
                </Field>
              )}
              {["login", "register", "reset"].includes(mode) && (
                <Field
                  label="Kata sandi"
                  error={form.formState.errors.password?.message}
                >
                  <Input
                    {...form.register("password")}
                    type="password"
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                  />
                </Field>
              )}
              {mode === "login" && (
                <p className="text-right text-xs">
                  <Link href="/forgot-password" className="underline">
                    Lupa kata sandi?
                  </Link>
                </p>
              )}
              {error && (
                <p
                  className="rounded-xl bg-red-50 p-4 text-sm text-red-800"
                  role="alert"
                >
                  {error}
                </p>
              )}
              {message && (
                <p
                  className="rounded-xl bg-green-50 p-4 text-sm text-green-800"
                  role="status"
                >
                  {message}
                </p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={
                  form.formState.isSubmitting || (mode === "verify" && !token)
                }
              >
                {form.formState.isSubmitting ? "Memproses…" : labels[mode][2]}
              </Button>
            </fieldset>
          </form>
          <div className="mt-7 space-y-4 text-center text-sm text-muted-foreground">
            {mode === "register" ? (
              <p>
                Sudah punya akun?{" "}
                <Link href="/login" className="font-semibold text-primary">
                  Masuk
                </Link>
              </p>
            ) : (
              <p>
                Belum punya akun?{" "}
                <Link href="/register" className="font-semibold text-primary">
                  Daftar
                </Link>
              </p>
            )}
            {mode === "login" && (
              <Link
                href="/resend-verification"
                className="block text-xs underline"
              >
                Kirim ulang email verifikasi
              </Link>
            )}
            <p className="text-xs">
              Dengan melanjutkan, Anda menyetujui{" "}
              <Link href="/terms" className="underline">
                syarat layanan
              </Link>{" "}
              dan{" "}
              <Link href="/privacy" className="underline">
                kebijakan privasi
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
