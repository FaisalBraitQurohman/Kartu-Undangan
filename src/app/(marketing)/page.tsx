import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Diamond,
  Heart,
  Infinity as InfinityIcon,
  Layers3,
  PencilLine,
  Play,
  Send,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhoneMockup } from "@/components/marketing/phone-mockup";
import { EditorShowcase } from "@/components/marketing/editor-showcase";
import { Catalog } from "@/components/marketing/catalog";
import { FAQ } from "@/components/marketing/faq";
export const dynamic = "force-dynamic";
const benefits = [
  {
    icon: Diamond,
    title: "Desain premium",
    text: "Detail yang dipilih dengan hati.",
  },
  { icon: InfinityIcon, title: "Sekali beli", text: "Gunakan selamanya." },
  {
    icon: PencilLine,
    title: "Mudah dikustomisasi",
    text: "Buat jadi cerita kalian.",
  },
  {
    icon: Send,
    title: "Bagikan dengan mudah",
    text: "Satu tautan, banyak kenangan.",
  },
];
export default function Home() {
  return (
    <main id="main" className="marketplace-home">
      <section className="marketplace-hero container-page">
        <div className="hero-layout">
          <div className="hero-copy">
            <p className="hero-label">Undangan digital untuk momen spesial</p>
            <h1 className="display">
              Setiap momen indah,
              <br />
              layak dikenang.
            </h1>
            <p className="hero-description">
              Buat undangan digital yang elegan dan personal.
              <br className="hidden lg:block" /> Pilih desain favorit, edit
              sesukamu, lalu bagikan dengan mudah.
            </p>
            <div className="hero-actions">
              <Button asChild size="lg">
                <Link href="#koleksi">
                  Jelajahi template <ArrowRight size={16} />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/demo/minimalist-ivory">
                  Lihat demo <Play size={13} />
                </Link>
              </Button>
            </div>
            <p className="hero-ownership">
              <Check size={14} /> Sekali beli, gunakan selamanya. Tanpa
              langganan.
            </p>
          </div>
          <div className="hero-phones">
            <div className="hero-arch" aria-hidden="true" />
            <p className="hero-handwritten">
              Desain elegan
              <br />
              untuk setiap cerita <Heart size={13} />
            </p>
            <Link
              className="hero-phone hero-phone-left"
              href="/demo/romantic-bloom"
              aria-label="Lihat demo Romantic Bloom"
            >
              <PhoneMockup templateKey="romantic-bloom" />
            </Link>
            <Link
              className="hero-phone hero-phone-right"
              href="/demo/emerald-garden"
              aria-label="Lihat demo Emerald Garden"
            >
              <PhoneMockup templateKey="emerald-garden" accent="#dbc29b" />
            </Link>
            <Link
              className="hero-phone hero-phone-center"
              href="/demo/minimalist-ivory"
              aria-label="Lihat demo Minimalist Ivory"
            >
              <PhoneMockup templateKey="minimalist-ivory" />
            </Link>
            <span className="hero-collection-note">
              Tiga desain, satu cerita yang istimewa.
            </span>
          </div>
        </div>
        <div className="hero-benefits">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div key={title}>
              <span className="benefit-icon">
                <Icon size={20} strokeWidth={1.5} />
              </span>
              <p>
                <strong>{title}</strong>
                <span>{text}</span>
              </p>
            </div>
          ))}
        </div>
      </section>
      <section id="koleksi" className="container-page marketplace-collection">
        <div className="marketplace-section-heading">
          <div>
            <p className="section-kicker">Koleksi UndangKita</p>
            <h2 className="display">
              Temukan desain yang terasa seperti kamu.
            </h2>
          </div>
          <Link href="/templates">
            Jelajahi koleksi <ArrowUpRight size={17} />
          </Link>
        </div>
        <Catalog />
      </section>
      <section
        className="container-page marketplace-reasons"
        aria-labelledby="alasan-heading"
      >
        <div className="centered-heading">
          <h2 id="alasan-heading" className="display">
            Indah untuk dilihat. Mudah untuk digunakan.
          </h2>
          <p>Semua yang kamu butuhkan untuk mengundang, dalam satu tempat.</p>
        </div>
        <div className="reason-grid">
          {[
            {
              icon: Diamond,
              title: "Desain penuh karakter",
              text: "Pilih gaya yang paling dekat dengan kisah dan momen kalian.",
            },
            {
              icon: InfinityIcon,
              title: "Sekali beli, gunakan selamanya",
              text: "Tanpa biaya langganan, masa aktif, atau batas jumlah undangan.",
            },
            {
              icon: Smartphone,
              title: "Nyaman di setiap layar",
              text: "Undangan tampil rapi di ponsel, tablet, dan desktop.",
            },
            {
              icon: ShieldCheck,
              title: "Kamu yang memegang kendali",
              text: "Atur tamu, RSVP, dan ucapan lewat dashboard pribadimu.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <article key={title}>
              <span className="benefit-icon">
                <Icon size={24} strokeWidth={1.4} />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section id="cara-kerja" className="container-page marketplace-steps">
        <div className="centered-heading">
          <p className="section-kicker">Dari ide menjadi undangan</p>
          <h2 className="display">Hanya tiga langkah mudah.</h2>
          <p>
            Lebih sedikit kerumitan. Lebih banyak waktu untuk hari bahagiamu.
          </p>
        </div>
        <ol className="step-grid">
          {[
            {
              icon: Layers3,
              title: "Pilih template",
              text: "Jelajahi koleksi dan coba preview desain yang kamu suka.",
              href: "/templates",
              link: "Temukan desain",
            },
            {
              icon: PencilLine,
              title: "Edit undangan",
              text: "Sesuaikan nama, tanggal, lokasi, foto, dan cerita kalian.",
              href: "#coba-editor",
              link: "Coba live preview",
            },
            {
              icon: Send,
              title: "Bagikan",
              text: "Publikasikan dan kirim tautan personal untuk para tamu.",
              href: "/cara-kerja",
              link: "Lihat cara kerja",
            },
          ].map(({ icon: Icon, title, text, href, link }, index) => (
            <li key={title}>
              <span className="step-number">0{index + 1}</span>
              <span className="step-icon">
                <Icon size={26} strokeWidth={1.4} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
              <Link href={href}>
                {link} <ArrowRight size={14} />
              </Link>
            </li>
          ))}
        </ol>
      </section>
      <section className="container-page marketplace-editor">
        <div className="editor-copy">
          <p className="section-kicker">Sentuhan personal, hasil istimewa</p>
          <h2 className="display">
            Mudah diedit,
            <br />
            hasilnya luar biasa.
          </h2>
          <p>
            Nama, cerita, dan detail kecil yang membuatnya menjadi milik kalian.
            Coba ubah contoh di sebelah dan lihat undanganmu berubah langsung.
          </p>
          <ul>
            {[
              "Pratinjau langsung saat mengedit",
              "Foto, musik, dan cerita dalam satu undangan",
              "RSVP dan ucapan tersimpan di dashboard",
            ].map((text) => (
              <li key={text}>
                <Check size={15} />
                {text}
              </li>
            ))}
          </ul>
          <Button asChild>
            <Link href="/register">
              Buat undangan pertamamu <ArrowRight size={15} />
            </Link>
          </Button>
        </div>
        <EditorShowcase />
      </section>
      <section className="container-page marketplace-faq">
        <div>
          <p className="section-kicker">Sebelum kamu mulai</p>
          <h2 className="display">
            Ada yang ingin
            <br />
            kamu tanyakan?
          </h2>
          <p>Kenali cara kerja UndangKita dan temukan jawabanmu di sini.</p>
          <Link href="/faq">
            Semua pertanyaan <ArrowUpRight size={15} />
          </Link>
        </div>
        <FAQ />
      </section>
      <section className="container-page marketplace-closing">
        <Image
          src="/images/wedding-floral.png"
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 1280px"
          className="closing-photo"
        />
        <div className="closing-shade" />
        <div className="closing-copy">
          <Heart size={29} strokeWidth={1.1} />
          <h2 className="display">
            Mulai cerita indahmu
            <br />
            bersama UndangKita.
          </h2>
          <p>
            Temukan desain untuk setiap momen berharga.
            <br />
            Sekali beli, gunakan berkali-kali.
          </p>
          <Button asChild>
            <Link href="#koleksi">
              Jelajahi template sekarang <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
