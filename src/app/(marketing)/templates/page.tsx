import { Catalog } from "@/components/marketing/catalog";
export const dynamic = "force-dynamic";
export const metadata = { title: "Pilihan template" };
export default function Templates() {
  return (
    <main id="main" className="container-page section-space">
      <h1 className="display text-5xl">Desain untuk cerita indahmu.</h1>
      <p className="mb-12 mt-6 max-w-xl text-sm leading-8 text-muted-foreground">
        Pilih template favorit. Setiap template premium dibeli sekali, lalu bisa
        digunakan untuk undangan tanpa batas.
      </p>
      <Catalog />
    </main>
  );
}
