import Image from "next/image";
import Link from "next/link";
import { PhoneMockup } from "./phone-mockup";

export function HeroShowcase() {
  return (
    <div className="editorial-showcase">
      <div className="editorial-scene" aria-hidden="true">
        <Image
          src="/images/editorial-wedding-stage.png"
          alt=""
          fill
          preload
          sizes="(max-width: 760px) 100vw, (max-width: 1100px) 55vw, 740px"
          className="editorial-scene-image"
        />
      </div>
      <Link
        href="/demo/minimalist-ivory"
        className="editorial-phone-link"
        aria-label="Lihat demo undangan Minimalist Ivory"
      >
        <PhoneMockup
          templateKey="minimalist-ivory"
          className="editorial-phone"
        />
      </Link>
      <p className="editorial-scene-note">
        Desain yang
        <br />
        menghidupkan
        <br />
        setiap momen.
      </p>
    </div>
  );
}
