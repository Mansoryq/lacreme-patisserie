import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar,
  Send,
  ArrowRight,
  Eye,
} from "lucide-react";
import { getCurrentAdmin } from "@/lib/auth";
import getDb from "@/lib/db";
import AdminTelegramRetryButton from "./AdminTelegramRetryButton";

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const db = getDb();
  const todayStr = new Date().toISOString().split("T")[0];

  // Live Metrics
  const statusCounts = db.prepare(`
    SELECT status, COUNT(id) as count
    FROM orders
    GROUP BY status
  `).all() as { status: string; count: number }[];

  const statusMap: Record<string, number> = {
    new: 0,
    pending: 0,
    confirmed: 0,
    in_progress: 0,
    ready: 0,
    completed: 0,
    cancelled: 0,
  };
  for (const s of statusCounts) {
    statusMap[s.status] = s.count;
  }

  const totalOrders = Object.values(statusMap).reduce((a, b) => a + b, 0);

  const revenueRow = db.prepare(`
    SELECT COALESCE(SUM(total_amount), 0) as total_revenue
    FROM orders
    WHERE status != 'cancelled'
  `).get() as any;

  const todayPickups = db.prepare(`
    SELECT COUNT(id) as count
    FROM orders
    WHERE pickup_date = ? AND status != 'cancelled'
  `).get(todayStr) as any;

  const recentOrders = db.prepare(`
    SELECT o.*, COUNT(oi.id) as items_count, COALESCE(nl.status, 'none') as telegram_status
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    LEFT JOIN notification_logs nl ON nl.order_id = o.id
    GROUP BY o.id
    ORDER BY o.id DESC
    LIMIT 6
  `).all() as any[];

  const tgLogs = db.prepare(`
    SELECT status, COUNT(id) as count
    FROM notification_logs
    GROUP BY status
  `).all() as { status: string; count: number }[];

  const tgHealth: Record<string, number> = { sent: 0, failed: 0, pending: 0 };
  for (const t of tgLogs) {
    tgHealth[t.status] = t.count;
  }

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800 border-blue-200",
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    confirmed: "bg-purple-100 text-purple-800 border-purple-200",
    in_progress: "bg-indigo-100 text-indigo-800 border-indigo-200",
    ready: "bg-teal-100 text-teal-800 border-teal-200",
    completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    cancelled: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const statusLabels: Record<string, string> = {
    new: "Новая",
    pending: "Ожидает",
    confirmed: "Подтверждена",
    in_progress: "В работе",
    ready: "Готова к выдаче",
    completed: "Выполнена",
    cancelled: "Отменена",
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cream-200">
        <div>
          <h1 className="font-serif text-3xl font-medium text-noir-950">
            Обзор кондитерской
          </h1>
          <p className="text-xs text-noir-500 font-light mt-0.5">
            Оперативная панель заказов и уведомлений • {new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-noir-900 hover:bg-brand-violet text-cream-50 rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors btn-press flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Все заявки ({totalOrders})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: New orders */}
        <div className="p-5 rounded-2xl bg-white border border-cream-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-noir-500 font-semibold">
              Новые заявки
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl font-bold text-noir-950">
            {statusMap.new}
          </div>
          <span className="text-[11px] text-noir-400 block">
            Требуют звонка и подтверждения
          </span>
        </div>

        {/* Card 2: Today's Pickups */}
        <div className="p-5 rounded-2xl bg-white border border-cream-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-noir-500 font-semibold">
              Выдача на сегодня
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl font-bold text-noir-950">
            {todayPickups?.count || 0}
          </div>
          <span className="text-[11px] text-noir-400 block">
            Запланировано на {todayStr}
          </span>
        </div>

        {/* Card 3: In Progress & Ready */}
        <div className="p-5 rounded-2xl bg-white border border-cream-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-noir-500 font-semibold">
              В работе / Готовы
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl font-bold text-noir-950">
            {statusMap.in_progress + statusMap.ready}
          </div>
          <span className="text-[11px] text-noir-400 block">
            Подтвержденные и выпекаемые
          </span>
        </div>

        {/* Card 4: Total Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-cream-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-noir-500 font-semibold">
              Оборот заявок
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl font-bold text-noir-950">
            {(revenueRow?.total_revenue || 0).toLocaleString("ru-RU")} ₸
          </div>
          <span className="text-[11px] text-noir-400 block">
            Активные заявки (без отмененных)
          </span>
        </div>
      </div>

      {/* Telegram Notifications Health Box */}
      <div className="p-6 rounded-2xl bg-white border border-cream-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-violet/10 text-brand-violet flex items-center justify-center flex-shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-medium text-noir-900">
              Состояние Telegram-интеграции
            </h3>
            <p className="text-xs text-noir-500 font-light">
              Отправлено: <b>{tgHealth.sent}</b> • Ожидают / ошибки: <b>{tgHealth.failed + tgHealth.pending}</b>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <AdminTelegramRetryButton failedCount={tgHealth.failed + tgHealth.pending} />
          <Link
            href="/admin/settings"
            className="px-4 py-2 bg-cream-100 hover:bg-cream-200 rounded-xl text-xs font-semibold text-noir-800 transition-colors btn-press"
          >
            Настройки бота
          </Link>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-2xl bg-white border border-cream-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-cream-200 flex items-center justify-between">
          <h2 className="font-serif text-xl font-medium text-noir-900">
            Последние поступившие заявки
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs uppercase tracking-wider font-semibold text-brand-violet hover:underline flex items-center gap-1"
          >
            Все заказы →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-noir-500">
            Заявок пока нет. Оформите первый заказ на сайте для проверки!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50/80 text-noir-500 uppercase tracking-wider text-[10px] border-b border-cream-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">№ Заказа</th>
                  <th className="py-3 px-4 font-semibold">Клиент</th>
                  <th className="py-3 px-4 font-semibold">Дата получения</th>
                  <th className="py-3 px-4 font-semibold">Сумма</th>
                  <th className="py-3 px-4 font-semibold">Статус</th>
                  <th className="py-3 px-4 font-semibold">Telegram</th>
                  <th className="py-3 px-4 text-right font-semibold">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-cream-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-brand-violet">
                      <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                        {o.order_number}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-noir-900 block">{o.customer_name}</span>
                      <span className="text-[11px] text-noir-400">{o.customer_phone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="block font-medium text-noir-900">{o.pickup_date}</span>
                      <span className="text-[11px] text-noir-500">{o.pickup_time}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-noir-900">
                      {o.total_amount.toLocaleString("ru-RU")} ₸
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                          statusColors[o.status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {statusLabels[o.status] || o.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {o.telegram_status === "sent" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Отправлено
                        </span>
                      ) : o.telegram_status === "failed" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-red-600">
                          <AlertCircle className="w-3.5 h-3.5" /> Ошибка
                        </span>
                      ) : (
                        <span className="text-[11px] text-noir-400">Ожидание</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="inline-flex items-center gap-1 p-2 rounded-lg bg-cream-100 hover:bg-cream-200 text-noir-800 transition-colors btn-press"
                        title="Открыть заказ"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium">Открыть</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
