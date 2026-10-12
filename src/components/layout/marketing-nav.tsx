"use client";
import Link from "next/link";
import { useState } from "react";
import { useHydrated } from "@/hooks/use-hydrated";
import { Menu, X, Flower2 } from "lucide-react";
import { Button } from "@/components/ui/button";
const links = [
  ["Beranda", "/"],
  ["Template", "/templates"],
  ["Cara kerja", "/cara-kerja"],
  ["FAQ", "/faq"],
];
export function MarketingNav() {
  const ready = useHydrated();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95">
      <nav
        aria-label="Navigasi utama"
        className="container-page flex min-h-20 items-center justify-between gap-6"
      >
        <Link href="/" className="flex items-center gap-2 font-serif text-2xl">
          <Flower2 className="text-ring" size={25} />
          UndangKita
        </Link>
        <div className="hidden items-center gap-8 text-sm md:flex">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-ring">
              {label}
            </Link>
          ))}
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <Link href="/login" className="text-sm font-semibold">
            Masuk
          </Link>
          <Button asChild size="sm">
            <Link href="/register">Mulai sekarang</Link>
          </Button>
        </div>
        <button
          className="p-2 md:hidden"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          disabled={!ready}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>
      {open && (
        <nav
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
