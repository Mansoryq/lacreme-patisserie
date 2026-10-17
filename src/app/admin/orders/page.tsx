import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import getDb from "@/lib/db";
import AdminOrdersClient from "./AdminOrdersClient";

export default async function AdminOrdersPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const db = getDb();
  const orders = db.prepare(`
    SELECT o.*,
           COUNT(oi.id) as items_count,
           COALESCE(nl.status, 'none') as telegram_status
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    LEFT JOIN notification_logs nl ON nl.order_id = o.id
    GROUP BY o.id
    ORDER BY o.id DESC
  `).all() as any[];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="pb-3 border-b border-cream-200">
        <h1 className="font-serif text-3xl font-medium text-noir-950">
          Заявки и заказы
        </h1>
        <p className="text-xs text-noir-500 font-light mt-0.5">
          Управление поступающими заявками, подтверждение, изменение статусов и связь с клиентами
        </p>
      </div>

      <Suspense fallback={<div className="py-12 text-center text-xs text-noir-500">Загрузка заявок...</div>}>
        <AdminOrdersClient initialOrders={orders} />
      </Suspense>
    </div>
  );
}
