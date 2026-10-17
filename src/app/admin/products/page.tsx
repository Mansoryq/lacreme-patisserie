import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import getDb from "@/lib/db";
import AdminProductsClient from "./AdminProductsClient";

export default async function AdminProductsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const db = getDb();
  const products = db.prepare(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    JOIN categories c ON c.id = p.category_id
    ORDER BY p.category_id ASC, p.display_order ASC
  `).all() as any[];

  const categories = db.prepare(`
    SELECT id, slug, name FROM categories ORDER BY display_order ASC
  `).all() as any[];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="pb-3 border-b border-cream-200">
        <h1 className="font-serif text-3xl font-medium text-noir-950">
          Управление каталогом десертов
        </h1>
        <p className="text-xs text-noir-500 font-light mt-0.5">
          Редактирование цен, описаний, доступности и статусов товаров в реальной базе данных
        </p>
      </div>

      <Suspense fallback={<div className="py-12 text-center text-xs text-noir-500">Загрузка товаров...</div>}>
        <AdminProductsClient initialProducts={products} categories={categories} />
      </Suspense>
    </div>
  );
}
