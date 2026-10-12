import Link from "next/link";
import { Flower2 } from "lucide-react";
export function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="container-page grid gap-8 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Link
            href="/"
            className="flex items-center gap-2 font-serif text-2xl"
          >
            <Flower2 size={24} />
            UndangKita
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
            Untuk momen yang ingin dikenang. Undangan yang terasa seperti
            ceritamu sendiri.
          </p>
        </div>
        <div className="grid gap-3 text-sm">
          <Link href="/templates">Pilihan template</Link>
          <Link href="/cara-kerja">Cara kerja</Link>
          <Link href="/faq">Pertanyaan umum</Link>
        </div>
        <div className="grid gap-3 text-sm">
          <Link href="/privacy">Kebijakan privasi</Link>
          <Link href="/terms">Syarat layanan</Link>
          <Link href="/contact">Hubungi kami</Link>
        </div>
      </div>
      <p className="container-page mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} UndangKita. Dibuat untuk cerita indah
        Indonesia.
      </p>
    </footer>
  );
}
