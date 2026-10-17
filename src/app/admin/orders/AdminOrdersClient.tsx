"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X, Calendar, Filter, Eye, Phone, CheckCircle2, AlertCircle, Clock } from "lucide-react";

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  order_type: string;
  pickup_date: string;
  pickup_time: string;
  total_amount: number;
  status: string;
  items_count: number;
  telegram_status: string;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  all: "Все",
  new: "Новые",
  pending: "Ожидают",
  confirmed: "Подтвержденные",
  in_progress: "В работе",
  ready: "Готовы",
  completed: "Выполненные",
  cancelled: "Отмененные",
};

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 border-blue-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-purple-100 text-purple-800 border-purple-200",
  in_progress: "bg-indigo-100 text-indigo-800 border-indigo-200",
  ready: "bg-teal-100 text-teal-800 border-teal-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function AdminOrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) {
        return false;
      }
      if (dateFilter && o.pickup_date !== dateFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNum = o.order_number.toLowerCase().includes(q);
        const matchName = o.customer_name.toLowerCase().includes(q);
        const matchPhone = o.customer_phone.toLowerCase().includes(q);
        if (!matchNum && !matchName && !matchPhone) return false;
      }
      return true;
    });
  }, [orders, statusFilter, dateFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {Object.entries(statusLabels).map(([key, label]) => {
          const isSelected = statusFilter === key;
          const count =
            key === "all" ? orders.length : orders.filter((o) => o.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all btn-press ${
                isSelected
                  ? "bg-noir-900 text-white shadow-sm"
                  : "bg-white text-noir-700 border border-cream-200 hover:bg-cream-100"
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* 2. Search & Date Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-cream-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-noir-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по номеру LC-..., имени или телефону..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-cream-50 border border-cream-200 text-xs text-noir-900 focus:outline-none focus:border-brand-violet"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-noir-400 hover:text-noir-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-cream-50 px-3 py-2 rounded-xl border border-cream-200 text-xs">
            <Calendar className="w-3.5 h-3.5 text-noir-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-noir-800 text-xs focus:outline-none"
            />
            {dateFilter && (
              <button onClick={() => setDateFilter("")} className="text-noir-400 hover:text-noir-700">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Orders Table */}
      <div className="rounded-2xl bg-white border border-cream-200 shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-xs text-noir-500">
            Заявок, удовлетворяющих фильтрам, не найдено.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50/80 text-noir-500 uppercase tracking-wider text-[10px] border-b border-cream-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">№ Заказа</th>
                  <th className="py-3.5 px-4 font-semibold">Клиент</th>
                  <th className="py-3.5 px-4 font-semibold">Дата и время</th>
                  <th className="py-3.5 px-4 font-semibold">Тип</th>
                  <th className="py-3.5 px-4 font-semibold">Сумма</th>
                  <th className="py-3.5 px-4 font-semibold">Статус</th>
                  <th className="py-3.5 px-4 font-semibold">Telegram</th>
                  <th className="py-3.5 px-4 text-right font-semibold">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-cream-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-brand-violet">
                      <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                        {o.order_number}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-noir-900 block">{o.customer_name}</span>
                      <a
                        href={`tel:${o.customer_phone.replace(/[^0-9+]/g, "")}`}
                        className="text-[11px] text-noir-500 hover:text-brand-violet transition-colors inline-flex items-center gap-1"
                      >
                        <Phone className="w-2.5 h-2.5" />
                        <span>{o.customer_phone}</span>
                      </a>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-noir-900 block">{o.pickup_date}</span>
                      <span className="text-[11px] text-noir-500">{o.pickup_time}</span>
                    </td>
                    <td className="py-3.5 px-4 text-noir-600">
                      {o.order_type === "delivery" ? "Доставка" : "Самовывоз"}
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
