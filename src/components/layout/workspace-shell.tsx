"use client";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { useHydrated } from "@/hooks/use-hydrated";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Flower2,
  LayoutDashboard,
  Palette,
  Heart,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  FileText,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
const userLinks = [
  ["/dashboard", "Ringkasan", LayoutDashboard],
  ["/dashboard/templates", "Jelajahi template", Palette],
  ["/dashboard/my-templates", "Template saya", Heart],
  ["/dashboard/invitations", "Undangan saya", FileText],
  ["/dashboard/purchases", "Pembelian", CreditCard],
  ["/dashboard/settings", "Pengaturan", Settings],
] as const;
const adminLinks = [
  ["/admin", "Ringkasan", LayoutDashboard],
  ["/admin/users", "Pengguna", Users],
  ["/admin/templates", "Template", Palette],
  ["/admin/invitations", "Undangan", FileText],
  ["/admin/orders", "Pesanan", CreditCard],
  ["/admin/payments", "Pembayaran", CreditCard],
  ["/admin/wishes", "Moderasi ucapan", MessageSquare],
  ["/admin/audit-logs", "Log aktivitas", Shield],
  ["/admin/settings", "Pengaturan", Settings],
] as const;
export function WorkspaceShell({
  children,
  name,
  admin = false,
  isAdmin = false,
}: {
  children: React.ReactNode;
  name: string;
  admin?: boolean;
  isAdmin?: boolean;
}) {
  const ready = useHydrated();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navigation = (
    <>
      <Link
        href="/"
        className="mb-10 flex items-center gap-2 font-serif text-2xl"
      >
        <Flower2 size={24} />
        UndangKita
      </Link>
      <p className="mb-4 text-xs text-muted-foreground">
        {admin ? "Administrasi platform" : "Ruang ceritamu"}
      </p>
      <nav aria-label="Menu dashboard" className="grid gap-2">
        {(admin ? adminLinks : userLinks).map(([href, label, Icon]) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${pathname === href || (href.endsWith("invitations") && pathname.startsWith(href)) ? "bg-primary text-white" : "hover:bg-secondary"}`}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto grid gap-3 pt-12 text-sm">
        {isAdmin && (
          <Link href={admin ? "/dashboard" : "/admin"}>
            {admin ? "Dashboard pengguna" : "Buka admin"}
          </Link>
        )}
        <button
          className="flex items-center gap-3 text-muted-foreground"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut size={16} />
          Keluar
        </button>
      </div>
    </>
  );
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
        <aside className="sticky top-0 hidden h-screen flex-col border-r border-border bg-white p-7 lg:flex">
          {navigation}
        </aside>
        <div>
          <header className="flex h-20 items-center justify-between border-b border-border bg-white px-6 lg:px-10">
            <Dialog.Trigger asChild>
              <button
                className="lg:hidden"
                aria-label="Buka menu dashboard"
                disabled={!ready}
                onClick={() => setOpen(true)}
              >
                <Menu />
              </button>
            </Dialog.Trigger>
            <p className="text-sm text-muted-foreground">
              Selamat datang,{" "}
              <span className="font-medium text-primary">{name}</span>
            </p>
            <Link
              href="/templates"
              className="text-xs underline underline-offset-4"
            >
              Lihat template
            </Link>
          </header>
          <main id="main" className="p-5 md:p-10">
            {children}
          </main>
        </div>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 lg:hidden" />
          <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white p-7 lg:hidden">
            <Dialog.Title className="sr-only">Menu dashboard</Dialog.Title>
            <Dialog.Description className="sr-only">
              Navigasi akun dan undangan
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                className="mb-6 self-end"
                aria-label="Tutup menu dashboard"
              >
                <X />
              </button>
            </Dialog.Close>
            {navigation}
          </Dialog.Content>
        </Dialog.Portal>
      </div>
    </Dialog.Root>
  );
}
