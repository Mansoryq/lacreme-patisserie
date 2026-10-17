import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://lacreme.kz"),
  title: "La Crème Boutique — Премиальная цифровая кондитерская в Астане",
  description:
    "Авторские торты на заказ, французские эклеры, круассаны и эксклюзивные десерты ручной работы. Основана Даной Канапиной в 2016 году. 10 лет гастрономического совершенства в Астане.",
  keywords: [
    "La Creme",
    "кондитерская Астана",
    "торт на заказ Астана",
    "премиум десерты",
    "французская выпечка",
    "Дана Канапина",
    "круассаны Астана",
    "эклеры Астана",
  ],
  openGraph: {
    title: "La Crème Boutique Pâtisserie | Астана",
    description: "Contemporary French Pâtisserie. Авторские десерты и торты на заказ.",
    url: "https://lacreme.kz",
    siteName: "La Crème Boutique",
    images: [
      {
        url: "/images/brand/logo.jpg",
        width: 800,
        height: 800,
        alt: "La Crème Boutique Pâtisserie",
      },
    ],
    locale: "ru_RU",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="min-h-screen flex flex-col bg-cream-50 text-noir-900 selection:bg-brand-violet selection:text-white">
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
