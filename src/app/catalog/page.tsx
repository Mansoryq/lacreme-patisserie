import React, { Suspense } from "react";
import getDb from "@/lib/db";
import CatalogClient from "./CatalogClient";

export const metadata = {
  title: "Каталог десертов и выпечки — La Crème Boutique Pâtisserie",
  description:
    "Фирменный каталог кондитерской La Crème в Астане. Авторские торты на заказ, баскские чизкейки, круассаны, эклеры и коллекционные наборы десертов.",
};

export default function CatalogPage() {
  const db = getDb();

  const categories = db.prepare(`
    SELECT c.*, COUNT(p.id) as product_count
    FROM categories c
    JOIN products p ON p.category_id = c.id AND p.is_active = 1
    WHERE c.is_active = 1
    GROUP BY c.id
    ORDER BY c.display_order ASC
  `).all() as any[];

  const products = db.prepare(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.is_active = 1 AND c.is_active = 1
    ORDER BY p.display_order ASC, p.id ASC
  `).all() as any[];

  return (
    <div className="site-shell pt-32 pb-20">
      {/* Editorial Header */}
      <div className="mb-12 border-b border-noir-900/20 pb-9">
        <h1 className="display-type text-5xl leading-[.9] text-noir-950 sm:text-7xl">Каталог десертов<br /><em>и выпечки.</em></h1>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-noir-600 sm:text-base">
          Все изделия создаются вручную шеф-кондитерами La Crème исключительно из натуральных европейских ингредиентов высшего качества.
        </p>
      </div>

      <Suspense fallback={<div className="py-20 text-center text-noir-500">Загрузка каталога...</div>}>
        <CatalogClient initialCategories={categories} initialProducts={products} />
      </Suspense>
    </div>
  );
}
