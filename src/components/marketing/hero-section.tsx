import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  Diamond,
  Infinity as InfinityIcon,
  PencilLine,
  Play,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  {
    icon: Diamond,
    title: "Desain premium",
    text: "Template elegan untuk berbagai momen spesial.",
  },
  {
    icon: InfinityIcon,
    title: "Sekali beli, selamanya",
    text: "Gunakan template milikmu tanpa batas waktu.",
  },
  {
    icon: PencilLine,
    title: "Mudah dikustomisasi",
    text: "Edit nama, tanggal, lokasi, foto, dan detail lainnya.",
  },
  {
    icon: Send,
    title: "Bagikan dengan mudah",
    text: "Publikasikan dan kirim tautan personal ke tamu.",
  },
];

export function HeroSection() {
  return (
    <section className="editorial-hero" aria-labelledby="hero-heading">
      <div className="editorial-background" aria-hidden="true">
        <Image
          src="/images/hero-mediterranean.png"
          alt=""
          fill
          preload
          sizes="100vw"
          className="editorial-background-image"
        />
      </div>
      <div className="editorial-readability-overlay" aria-hidden="true" />
      <div className="editorial-hero-inner">
        <div className="editorial-content">
          <p className="editorial-eyebrow">
            Undangan digital untuk momen spesial
            <span aria-hidden="true" />
          </p>
          <h1 id="hero-heading" className="editorial-heading">
            <span>Lebih dari</span>
            <span>Sekadar Undangan,</span>
            <em>
              <span>Ini Cerita Tentang</span>
              <span>Awal yang Indah.</span>
            </em>
          </h1>
          <p className="editorial-description">
            Wujudkan undangan digital yang elegan dan personal. Pilih desain
            favorit, edit sesukamu, lalu bagikan dengan mudah ke orang-orang
            terdekat.
          </p>
          <div className="editorial-actions">
            <Button asChild size="lg">
              <Link href="#koleksi">
                Jelajahi Template <ArrowRight size={17} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/demo/minimalist-ivory">
                <Play size={15} fill="currentColor" /> Lihat Demo
              </Link>
            </Button>
          </div>
          <p className="editorial-ownership">
            <Check size={15} /> Sekali beli. Undangan tanpa batas. Tanpa
            langganan.
          </p>
        </div>
      </div>
      <div className="editorial-benefits-wrap">
        <div className="editorial-benefits">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div key={title}>
              <span className="editorial-benefit-icon">
                <Icon size={28} strokeWidth={1.4} />
              </span>
              <div>
                <h2>{title}</h2>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
