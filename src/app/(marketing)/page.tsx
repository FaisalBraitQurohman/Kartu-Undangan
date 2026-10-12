import Link from "next/link";
import {
  ArrowUpRight,
  Palette,
  HeartHandshake,
  Sparkles,
  Send,
  Check,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplateCover } from "@/templates/renderer";
import { demoContent } from "@/validators/invitation";
import { Catalog } from "@/components/marketing/catalog";
import { FAQ } from "@/components/marketing/faq";
export const dynamic = "force-dynamic";
export default function Home() {
  return (
    <main id="main">
      <section className="container-page grid items-center gap-14 pb-24 pt-12 md:grid-cols-[1.1fr_1fr] md:pt-20">
        <div>
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs">
            <span className="size-1.5 rounded-full bg-ring" />
            Dirangkai untuk hari istimewamu
          </p>
          <h1 className="display max-w-xl text-5xl sm:text-6xl lg:text-7xl">
            Setiap Momen Indah, Layak Dikenang.
          </h1>
          <p className="mt-7 max-w-md text-base leading-8 text-muted-foreground">
            Buat undangan digital yang elegan dan personal. Pilih desain
            favorit, edit sesukamu, lalu bagikan dengan mudah.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/templates">
                Jelajahi template
                <ArrowUpRight size={17} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/demo/minimalist-ivory">Lihat demo</Link>
            </Button>
          </div>
          <p className="mt-7 flex items-center gap-2 text-xs text-muted-foreground">
            <Check size={15} />
            Sekali beli. Tanpa masa aktif. Milikmu selamanya.
          </p>
        </div>
        <div className="hero-stationery">
          <TemplateCover templateKey="minimalist-ivory" content={demoContent} />
          <div className="hero-note">
            <span className="font-serif text-lg">
              Cerita kalian, cara kalian.
            </span>
            <p className="mt-2 text-muted-foreground">
              Contoh desain Minimalist Ivory
            </p>
          </div>
        </div>
      </section>
      <section className="border-y border-border bg-white/50 py-10">
        <div className="container-page grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Palette, "Desain premium", "Setiap detail punya cerita."],
            [
              HeartHandshake,
              "Sekali beli, gunakan selamanya",
              "Tanpa tagihan berulang.",
            ],
            [Sparkles, "Mudah dikustomisasi", "Ubah sesuai kisah kalian."],
            [Send, "Bagikan dengan mudah", "Satu tautan untuk semua."],
          ].map(([Icon, title, text]) => {
            const I = Icon as typeof Palette;
            return (
              <div key={String(title)} className="flex gap-4">
                <I className="shrink-0 text-ring" size={24} />
                <div>
                  <h2 className="text-sm font-semibold">{String(title)}</h2>
                  <p className="mt-2 text-xs leading-6 text-muted-foreground">
                    {String(text)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <section className="container-page section-space">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="display text-4xl">
              Pilih yang terasa seperti kamu.
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Dari sederhana hingga megah, temukan desain untuk ceritamu.
            </p>
          </div>
          <Link
            href="/templates"
            className="flex items-center gap-2 text-sm font-semibold"
          >
            Semua template
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <Catalog limit={4} />
      </section>
      <section className="bg-secondary/40">
        <div className="container-page section-space grid gap-12 md:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="display text-4xl">
              Dari sebuah pilihan,
              <br />
              menjadi sebuah undangan.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-8 text-muted-foreground">
              Tiga langkah sederhana. Lebih banyak waktu untuk menikmati
              persiapan hari bahagia.
            </p>
            <Button asChild variant="outline" className="mt-7">
              <Link href="/cara-kerja">Lihat cara kerja</Link>
            </Button>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              [
                "01",
                "Pilih template",
                "Temukan desain. Gratis atau premium, semua punya pesona.",
              ],
              [
                "02",
                "Edit undangan",
                "Isi nama, acara, cerita, dan foto. Lihat hasilnya langsung.",
              ],
              [
                "03",
                "Bagikan",
                "Publikasikan dan kirim tautan personal untuk setiap tamu.",
              ],
            ].map(([n, title, text]) => (
              <div key={n} className="border-t border-border pt-6">
                <span className="font-serif text-4xl text-ring">{n}</span>
                <h3 className="my-4 font-serif text-xl">{title}</h3>
                <p className="text-sm leading-7 text-muted-foreground">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="container-page section-space grid items-center gap-12 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_12px_50px_#3b302b0a]">
          <div className="flex items-center justify-between border-b border-border px-5 py-4 text-xs">
            <span className="flex items-center gap-2">
              <Pencil size={14} />
              Editor undangan
            </span>
            <span className="text-muted-foreground">Contoh tampilan</span>
          </div>
          <div className="grid grid-cols-[1fr_1fr] gap-4 p-5">
            <div className="space-y-5 py-4 text-xs">
              <p className="font-semibold">Identitas pasangan</p>
              <div>
                <p className="mb-2 text-muted-foreground">Nama mempelai</p>
                <div className="rounded-lg border border-border p-3">
                  Alya Putri
                </div>
              </div>
              <div>
                <p className="mb-2 text-muted-foreground">Nama pasangan</p>
                <div className="rounded-lg border border-border p-3">
                  Rizky Pratama
                </div>
              </div>
              <p className="text-muted-foreground">
                Perubahan tampil di pratinjau.
              </p>
            </div>
            <div className="template-mini overflow-hidden rounded-t-[80px]">
              <TemplateCover
                templateKey="romantic-bloom"
                content={demoContent}
              />
            </div>
          </div>
        </div>
        <div>
          <h2 className="display text-4xl">
            Setiap detail,
            <br />
            punya sentuhanmu.
          </h2>
          <p className="mt-6 max-w-md text-sm leading-8 text-muted-foreground">
            Tidak perlu paham desain. Editor yang sederhana membantumu menata
            cerita, foto, musik, dan semua informasi penting dalam satu tempat.
          </p>
          <ul className="my-7 space-y-3 text-sm">
            {[
              "Pratinjau langsung saat mengedit",
              "Tautan personal untuk para tamu",
              "RSVP dan ucapan dalam satu dashboard",
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <Check size={16} className="text-ring" />
                {t}
              </li>
            ))}
          </ul>
          <Button asChild>
            <Link href="/register">Buat undangan pertamamu</Link>
          </Button>
        </div>
      </section>
      <section className="container-page section-space grid gap-10 md:grid-cols-[.7fr_1.3fr]">
        <div>
          <h2 className="display text-4xl">
            Sebelum kamu
            <br />
            memulai.
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Hal-hal yang mungkin ingin kamu ketahui.
          </p>
        </div>
        <FAQ />
      </section>
      <section className="bg-primary text-white">
        <div className="container-page py-20 text-center">
          <p className="mb-5 font-serif text-xl text-white/60">
            Sebuah momen. Sebuah cerita.
          </p>
          <h2 className="display mx-auto max-w-2xl text-4xl sm:text-5xl">
            Mulai Cerita Indahmu Bersama UndangKita
          </h2>
          <Button
            asChild
            className="mt-8 bg-secondary text-primary hover:bg-white"
          >
            <Link href="/templates">
              Temukan template pilihanmu
              <ArrowUpRight size={18} />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
