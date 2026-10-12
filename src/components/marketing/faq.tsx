export const faqItems = [
  [
    "Apakah template hanya dibeli sekali?",
    "Ya. Setiap template premium cukup dibeli sekali untuk akun Anda. Tidak ada langganan atau tagihan berulang.",
  ],
  [
    "Apakah undangan memiliki masa aktif?",
    "Tidak ada masa aktif atau batas waktu undangan. Akses tetap bergantung pada ketersediaan layanan dan kepatuhan terhadap syarat penggunaan.",
  ],
  [
    "Apakah template bisa digunakan berkali-kali?",
    "Bisa. Satu template yang Anda miliki dapat dipakai untuk membuat undangan tanpa batas. Template lain tetap dibeli secara terpisah.",
  ],
  [
    "Apakah undangan bisa diedit setelah dipublikasikan?",
    "Ya. Ubah isi undangan kapan saja dan simpan. Tidak ada biaya edit atau publikasi ulang.",
  ],
  [
    "Apakah tersedia template gratis?",
    "Ada. Pilih template berlabel Gratis untuk mulai membuat undangan tanpa pembayaran.",
  ],
];
export function FAQ() {
  return (
    <div className="divide-y divide-border">
      {faqItems.map(([q, a]) => (
        <details key={q} className="group py-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-medium">
            {q}
            <span
              aria-hidden="true"
              className="text-2xl font-light group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-muted-foreground">
            {a}
          </p>
        </details>
      ))}
    </div>
  );
}
