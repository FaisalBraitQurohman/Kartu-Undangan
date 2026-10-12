import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="container-page py-24 text-center">
      <h1 className="display text-4xl">Halaman tidak ditemukan.</h1>
      <p className="my-6 text-sm text-muted-foreground">
        Tautan tidak berlaku atau undangan belum dipublikasikan.
      </p>
      <Link className="underline" href="/">
        Kembali ke beranda
      </Link>
    </main>
  );
}
