import React from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Cake, Settings, LogOut, ArrowLeft, ExternalLink } from "lucide-react";
import { getCurrentAdmin } from "@/lib/auth";
import AdminLogoutButton from "./AdminLogoutButton";

export const metadata = {
  title: "Управление заказами — La Crème Admin",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  // If not authenticated, the pages inside will handle or redirect (except login page)
  return (
    <div className="min-h-screen bg-cream-100/70 text-noir-900 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-noir-950 text-cream-50 flex-shrink-0 flex flex-col justify-between border-r border-noir-850 p-5">
        <div className="space-y-8">
          {/* Brand header */}
          <div className="flex items-center gap-3 pb-4 border-b border-noir-850">
            <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src="/images/brand/logo.jpg"
                alt="La Crème"
                fill
                className="object-cover"
                sizes="36px"
              />
            </div>
            <div>
              <span className="font-serif text-lg font-semibold tracking-wider block">
                LA CRÈME
              </span>
              <span className="text-[9px] tracking-widest text-cream-400 uppercase block -mt-0.5">
                Панель управления
              </span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="space-y-1.5">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-medium text-cream-200 hover:text-white hover:bg-noir-850 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-brand-violet" />
              <span>Главная / Обзор</span>
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-medium text-cream-200 hover:text-white hover:bg-noir-850 transition-colors"
            >
              <ShoppingCart className="w-4 h-4 text-brand-gold" />
              <span>Заявки и заказы</span>
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-medium text-cream-200 hover:text-white hover:bg-noir-850 transition-colors"
            >
              <Cake className="w-4 h-4 text-pink-400" />
              <span>Управление каталогом</span>
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-medium text-cream-200 hover:text-white hover:bg-noir-850 transition-colors"
            >
              <Settings className="w-4 h-4 text-emerald-400" />
              <span>Расписание и Telegram</span>
            </Link>
          </nav>
        </div>

        {/* Footer actions & user profile */}
        <div className="pt-6 border-t border-noir-850 space-y-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-xs text-cream-400 hover:text-cream-100 transition-colors px-1"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Открыть сайт</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {admin && (
            <div className="flex items-center justify-between bg-noir-900 p-3 rounded-xl border border-noir-800">
              <div className="min-w-0 pr-2">
                <span className="text-xs font-semibold text-white block truncate">
                  {admin.name}
                </span>
                <span className="text-[10px] text-cream-400 uppercase tracking-widest block">
                  {admin.role === "owner" ? "Владелец" : "Сотрудник"}
                </span>
              </div>
              <AdminLogoutButton />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
