"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X, ArrowUpRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

const links = [
  { href: "/catalog", label: "Каталог" },
  { href: "/catalog?category=cakes-whole", label: "Торты на заказ" },
  { href: "/about", label: "О бренде" },
  { href: "/contact", label: "Контакты" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { totalCount, openCart } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const update = () => setScrolled(window.scrollY > 8); update(); window.addEventListener("scroll", update); return () => window.removeEventListener("scroll", update); }, []);
  if (pathname.startsWith("/admin")) return null;
  return <header className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${scrolled ? "header-glass" : "bg-cream-50/90"}`}>
    <div className="site-shell">
      <div className="flex h-[4.75rem] items-center justify-between">
        <Link href="/" className="group leading-none" aria-label="La Crème — главная"><span className="display-type block text-[1.65rem] tracking-[-.05em] text-noir-950 sm:text-3xl">LA CRÈME</span><span className="block pt-0.5 text-[.5rem] font-semibold tracking-[.35em] text-brand-violet">BOUTIQUE PÂTISSERIE</span></Link>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Основная навигация">{links.map((item) => <Link key={item.href} href={item.href} className={`text-[.69rem] font-semibold uppercase tracking-[.12em] transition-colors ${pathname === item.href ? "text-brand-violet" : "text-noir-700 hover:text-brand-violet"}`}>{item.label}</Link>)}</nav>
        <div className="flex items-center gap-3"><button onClick={openCart} aria-label="Открыть корзину" className="relative grid h-10 w-10 place-items-center border border-noir-900/20 text-noir-900 transition-colors hover:border-brand-violet hover:text-brand-violet"><ShoppingBag className="h-[1.05rem] w-[1.05rem] stroke-[1.5]" />{totalCount > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand-violet px-1 text-[9px] font-bold text-white">{totalCount}</span>}</button><Link href="/catalog" className="button-primary hidden min-h-10 px-4 py-2 lg:inline-flex">Выбрать десерты <ArrowUpRight className="h-3.5 w-3.5" /></Link><button onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center border border-noir-900/20 lg:hidden" aria-label={open ? "Закрыть меню" : "Открыть меню"}>{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button></div>
      </div>
      {open && <nav className="border-t border-noir-900/15 py-4 lg:hidden" aria-label="Мобильная навигация">{links.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="block border-b border-noir-900/10 py-3 text-sm text-noir-900">{item.label}</Link>)}</nav>}
    </div>
  </header>;
}
