"use client";

import Link from "next/link";
import { Instagram, MapPin, Phone } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <footer className="bg-[#2d2135] text-cream-50"><div className="site-shell py-12 sm:py-16"><div className="grid gap-10 border-b border-white/20 pb-12 md:grid-cols-2 lg:grid-cols-4"><div className="lg:col-span-2"><p className="display-type text-5xl tracking-[-.05em]">LA CRÈME</p><p className="mt-1 text-[.56rem] font-semibold tracking-[.32em] text-lilac">BOUTIQUE PÂTISSERIE</p><p className="mt-6 max-w-md text-sm leading-6 text-cream-300">Десерты и выпечка, созданные для личных традиций, тёплых встреч и особенных дней.</p></div><div><p className="micro-label text-lilac">Разделы</p><nav className="mt-5 grid gap-3 text-sm text-cream-200"><Link href="/catalog" className="hover:text-white">Каталог</Link><Link href="/catalog?category=cakes-whole" className="hover:text-white">Торты на заказ</Link><Link href="/about" className="hover:text-white">История бренда</Link><Link href="/contact" className="hover:text-white">Контакты</Link></nav></div><div><p className="micro-label text-lilac">Бутик в Астане</p><div className="mt-5 grid gap-4 text-sm leading-5 text-cream-200"><span className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-lilac" />Достык, 16<br />Talan Towers</span><a href="tel:+77010002016" className="flex gap-2 hover:text-white"><Phone className="h-4 w-4 shrink-0 text-lilac" />+7 (701) 000-20-16</a><a href="https://www.instagram.com/la_creme_astana/" target="_blank" rel="noopener noreferrer" className="flex gap-2 hover:text-white"><Instagram className="h-4 w-4 shrink-0 text-lilac" />@la_creme_astana</a></div></div></div><div className="flex flex-col gap-3 pt-6 text-[.68rem] text-cream-400 sm:flex-row sm:justify-between"><span>© {new Date().getFullYear()} La Crème Boutique Pâtisserie</span><Link href="/admin/login" className="hover:text-white">Панель управления</Link></div></div></footer>;
}
