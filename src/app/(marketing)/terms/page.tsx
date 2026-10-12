export const metadata = { title: "Syarat layanan" };
export default function Page() {
  return (
    <main id="main" className="container-page section-space max-w-3xl">
      <h1 className="display text-4xl">Syarat layanan</h1>
      <div className="mt-8 space-y-8 text-sm leading-8">
        <section>
          <h2 className="font-semibold">Pembelian template</h2>
          <p>
            Setiap template premium dibeli sekali per akun. Pembelian membuka
            template tersebut untuk pembuatan undangan tanpa batas. Tidak ada
            langganan, biaya publikasi ulang, atau masa aktif undangan. Harga
            baru tidak mengubah transaksi sebelumnya.
          </p>
        </section>
        <section>
          <h2 className="font-semibold">Penggunaan wajar</h2>
          <p>
            Gunakan media yang hak penggunaannya Anda miliki. Dilarang
            menyebarkan konten melanggar hukum, spam, malware, atau mengakses
            data orang lain. Jumlah undangan tidak dibatasi, tetapi ukuran dan
            jumlah media per undangan dibatasi untuk penggunaan wajar.
          </p>
        </section>
        <section>
          <h2 className="font-semibold">Pembayaran dan pengembalian</h2>
          <p>
            Template terbuka setelah pembayaran diverifikasi oleh server. Status
            pengembalian dana atau chargeback yang terverifikasi dapat
            membatalkan akses yang berasal dari transaksi tersebut. Catatan
            keuangan tetap disimpan.
          </p>
        </section>
        <section>
          <h2 className="font-semibold">Ketersediaan layanan</h2>
          <p>
            Akses tanpa masa aktif tunduk pada ketersediaan normal layanan dan
            pembatasan akun yang sah. Lindungi kata sandi serta tautan tamu
            Anda.
          </p>
        </section>
      </div>
    </main>
  );
}
