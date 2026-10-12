import { FAQ } from "@/components/marketing/faq";
export const metadata = { title: "Pertanyaan umum" };
export default function Page() {
  return (
    <main id="main" className="container-page section-space max-w-3xl">
      <h1 className="display mb-10 text-5xl">Hal yang ingin kamu ketahui.</h1>
      <FAQ />
    </main>
  );
}
