"use client";
import Link from "next/link";
import { useState } from "react";
import { useHydrated } from "@/hooks/use-hydrated";
import { Menu, X, Heart, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
const links = [
  ["Beranda", "/"],
  ["Template", "/templates"],
  ["Cara kerja", "/cara-kerja"],
  ["FAQ", "/faq"],
];
export function MarketingNav() {
  const ready = useHydrated();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="marketplace-nav sticky top-0 z-40">
      <nav
        aria-label="Navigasi utama"
        className="container-page flex min-h-20 items-center justify-between gap-6"
      >
        <Link
          href="/"
          className="brand-link flex items-center gap-2 font-serif text-2xl"
        >
          <Heart className="brand-heart" size={27} strokeWidth={1.3} />
          UndangKita
        </Link>
        <div className="hidden items-center gap-8 text-sm md:flex">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className="nav-link"
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/templates#pencarian-template"
            className="nav-search"
            aria-label="Cari template"
          >
            <Search size={18} />
          </Link>
          <Link href="/login" className="nav-login text-sm font-semibold">
            Masuk
          </Link>
          <Button asChild size="sm" className="nav-register">
            <Link href="/register">Daftar gratis</Link>
          </Button>
        </div>
        <button
          className="p-2 md:hidden"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          disabled={!ready}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>
      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Navigasi seluler"
          className="grid gap-4 border-t border-border p-6 md:hidden"
        >
          {[...links, ["Masuk", "/login"], ["Daftar", "/register"]].map(
            ([label, href]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>
                {label}
              </Link>
            ),
          )}
        </nav>
      )}
    </header>
  );
}
