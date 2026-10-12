export const metadata = { title: "Kebijakan privasi" };
export default function Page() {
  return (
    <main id="main" className="container-page section-space max-w-3xl">
      <h1 className="display text-4xl">Kebijakan privasi</h1>
      <div className="mt-8 space-y-8 text-sm leading-8">
        <section>
          <h2 className="font-semibold">Data yang digunakan</h2>
          <p>
            UndangKita memproses identitas akun, konten undangan, daftar tamu,
            RSVP, ucapan, dan catatan transaksi untuk menyediakan layanan.
            Daftar tamu dan informasi RSVP hanya dapat dikelola pemilik
            undangan.
          </p>
        </section>
        <section>
          <h2 className="font-semibold">Undangan publik</h2>
          <p>
            Konten yang dipublikasikan dapat diakses melalui tautan undangan.
            Jangan menambahkan informasi sensitif pada konten publik. Tautan
            tamu bersifat personal; bagikan hanya kepada penerimanya.
          </p>
        </section>
        <section>
          <h2 className="font-semibold">Penyedia layanan</h2>
          <p>
            Pembayaran diproses Midtrans, media disimpan Cloudinary, email
            dikirim Resend. Layanan infrastruktur dan pemantauan dapat memproses
            data teknis seperlunya. UndangKita tidak menyimpan nomor kartu
            pembayaran.
          </p>
        </section>
        <section>
          <h2 className="font-semibold">Kontrol data</h2>
          <p>
            Anda dapat mengedit undangan, menghapus tamu, menyembunyikan ucapan,
            dan membatalkan publikasi dari dashboard. Catatan transaksi tetap
            disimpan untuk integritas pembelian. Hubungi pengelola melalui
            saluran bantuan akun untuk permintaan terkait data pribadi.
          </p>
        </section>
      </div>
    </main>
  );
}
