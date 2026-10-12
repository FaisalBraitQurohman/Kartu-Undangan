"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main" className="container-page py-24 text-center">
      <h1 className="display text-3xl">Halaman belum dapat dimuat.</h1>
      <p className="my-5 text-sm text-muted-foreground">
        Layanan sedang tidak tersedia. Coba lagi atau kembali beberapa saat
        lagi.
      </p>
      <Button onClick={reset}>Coba lagi</Button>
    </main>
  );
}
