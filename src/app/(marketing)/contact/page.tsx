import { ContactForm } from "@/components/contact-form";
export const metadata = { title: "Hubungi kami" };
export default function Page() {
  return (
    <main id="main" className="container-page section-space max-w-xl">
      <h1 className="display text-4xl">Kami siap mendengarkan.</h1>
      <p className="mt-5 text-sm leading-8 text-muted-foreground">
        Ada pertanyaan tentang akun, pembelian, atau data pribadi? Kirim pesan
        kepada pengelola UndangKita.
      </p>
      <ContactForm />
    </main>
  );
}
