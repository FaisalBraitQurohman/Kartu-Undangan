import Link from "next/link";
import { Button } from "@/components/ui/button";
export const metadata = { title: "Cara kerja" };
export default function Page() {
  return (
    <main id="main" className="container-page section-space max-w-3xl">
      <h1 className="display text-5xl">Undanganmu, dalam tiga langkah.</h1>
      <div className="my-12 space-y-10">
        {[
          [
            "Pilih template",
            "Daftar dan temukan desain yang cocok. Template gratis langsung bisa digunakan. Template premium dibeli sekali melalui Midtrans.",
          ],
          [
            "Edit undangan",
            "Buat undangan, isi identitas pasangan dan detail acara, unggah foto serta musik, lalu lihat pratinjau langsung. Simpan draf sampai semua siap.",
          ],
          [
            "Bagikan",
            "Publikasikan undangan. Tambahkan nama tamu dan kirim tautan personal lewat WhatsApp. Pantau RSVP dan moderasi ucapan dari dashboard.",
          ],
        ].map(([t, d], i) => (
          <section key={t} className="flex gap-7">
            <span className="font-serif text-4xl text-ring">{i + 1}</span>
            <div>
              <h2 className="font-serif text-2xl">{t}</h2>
              <p className="mt-3 text-sm leading-8 text-muted-foreground">
                {d}
              </p>
            </div>
          </section>
        ))}
      </div>
      <Button asChild>
        <Link href="/register">Mulai sekarang</Link>
      </Button>
    </main>
  );
}
