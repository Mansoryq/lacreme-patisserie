"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  MessageCircle,
  Save,
  CheckCircle2,
  AlertCircle,
  Send,
  Check,
} from "lucide-react";

interface Props {
  order: any;
  items: any[];
  logs: any[];
}

const statusOptions = [
  { value: "new", label: "Новая заявка", color: "bg-blue-100 text-blue-800" },
  { value: "pending", label: "Ожидает согласования", color: "bg-amber-100 text-amber-800" },
  { value: "confirmed", label: "Подтверждена", color: "bg-purple-100 text-purple-800" },
  { value: "in_progress", label: "В работе / Цех", color: "bg-indigo-100 text-indigo-800" },
  { value: "ready", label: "Готова к выдаче", color: "bg-teal-100 text-teal-800" },
  { value: "completed", label: "Выполнена", color: "bg-emerald-100 text-emerald-800" },
  { value: "cancelled", label: "Отменена / Отклонена", color: "bg-gray-100 text-gray-700" },
];

export default function AdminOrderDetailInteractive({ order, items, logs }: Props) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [adminNotes, setAdminNotes] = useState(order.admin_notes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const cleanPhone = order.customer_phone.replace(/[^0-9+]/g, "");

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === "cancelled" && !confirm("Вы действительно хотите отменить/отклонить эту заявку?")) {
      return;
    }

    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentStatus(newStatus);
        router.refresh();
      } else {
        alert(data.error || "Ошибка при смене статуса");
      }
    } catch {
      alert("Сетевая ошибка");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    setNotesSaved(false);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes }),
      });
      const data = await res.json();
      if (data.success) {
        setNotesSaved(true);
        setTimeout(() => setNotesSaved(false), 2000);
      } else {
        alert(data.error || "Ошибка сохранения заметок");
      }
    } catch {
      alert("Сетевая ошибка");
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Order Content */}
      <div className="lg:col-span-8 space-y-6">
        {/* Customer & Delivery Card */}
        <div className="p-6 rounded-3xl bg-white border border-cream-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-200 pb-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-noir-400 font-semibold block">
                Заявка на заказ
              </span>
              <h2 className="font-serif text-2xl font-medium text-noir-950">
                № {order.order_number}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${cleanPhone}`}
                className="px-3.5 py-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-noir-900 text-xs font-semibold flex items-center gap-1.5 transition-colors btn-press"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>Позвонить</span>
              </a>
              <a
                href={`https://wa.me/${cleanPhone.replace("+", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors btn-press"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-noir-400 uppercase tracking-wider text-[10px] block">Имя клиента</span>
              <span className="font-semibold text-sm text-noir-900 block mt-0.5">{order.customer_name}</span>
            </div>
            <div>
              <span className="text-noir-400 uppercase tracking-wider text-[10px] block">Телефон</span>
              <span className="font-mono font-semibold text-sm text-noir-900 block mt-0.5">{order.customer_phone}</span>
            </div>
            {order.customer_email && (
              <div>
                <span className="text-noir-400 uppercase tracking-wider text-[10px] block">Email</span>
                <span className="text-noir-800 block mt-0.5">{order.customer_email}</span>
              </div>
            )}
            <div>
              <span className="text-noir-400 uppercase tracking-wider text-[10px] block">Способ получения</span>
              <span className="font-semibold text-noir-900 block mt-0.5">
                {order.order_type === "delivery" ? "Доставка курьером" : "Самовывоз из бутика"}
              </span>
            </div>
          </div>

          {order.order_type === "delivery" && order.delivery_address && (
            <div className="pt-2 border-t border-cream-100 text-xs">
              <span className="text-noir-400 uppercase tracking-wider text-[10px] block">Адрес доставки:</span>
              <span className="font-medium text-noir-900 block mt-0.5">{order.delivery_address}</span>
            </div>
          )}

          {order.comment && (
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/60 text-xs text-noir-800">
              <b className="font-semibold text-amber-900 block mb-0.5">Комментарий клиента:</b>
              {order.comment}
            </div>
          )}
        </div>

        {/* Items Breakdown Card */}
        <div className="p-6 rounded-3xl bg-white border border-cream-200 shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-medium text-noir-900 border-b border-cream-200 pb-3">
            Состав заказа ({items.length} {items.length === 1 ? "позиция" : "позиции"})
          </h3>

          <div className="divide-y divide-cream-100">
            {items.map((it) => (
              <div key={it.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                    <Image
                      src={it.image_url || "/images/products/porsche-cake.jpg"}
                      alt={it.product_name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div>
                    <span className="font-medium text-noir-950 block">{it.product_name}</span>
                    <span className="text-xs text-noir-500 font-light block">
                      {it.quantity} шт × {it.price.toLocaleString("ru-RU")} ₸
                    </span>
                  </div>
                </div>

                <span className="font-semibold text-noir-900">
                  {it.total.toLocaleString("ru-RU")} ₸
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-cream-200 flex justify-between items-baseline">
            <span className="font-serif text-base text-noir-900 font-medium">Итоговая сумма:</span>
            <span className="font-serif text-2xl font-bold text-noir-950">
              {order.total_amount.toLocaleString("ru-RU")} ₸
            </span>
          </div>
        </div>

        {/* Telegram Logs */}
        <div className="p-6 rounded-3xl bg-white border border-cream-200 shadow-sm space-y-3">
          <h3 className="font-serif text-base font-medium text-noir-900 flex items-center gap-2">
            <Send className="w-4 h-4 text-brand-violet" />
            <span>История Telegram-уведомлений</span>
          </h3>

          {logs.length === 0 ? (
            <p className="text-xs text-noir-400">Уведомление еще не отправлялось</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-cream-50 border border-cream-200 flex items-start justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          log.status === "sent"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {log.status === "sent" ? "Доставлено в Telegram" : "Ошибка доставки"}
                      </span>
                      <span className="text-[11px] text-noir-400">{log.last_attempt_at}</span>
                    </div>
                    {log.error_message && (
                      <p className="text-red-700 mt-1 font-mono text-[11px]">{log.error_message}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-noir-400">Попыток: {log.attempts}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Status & Internal Notes */}
      <div className="lg:col-span-4 space-y-6">
        {/* Status Switcher Card */}
        <div className="p-6 rounded-3xl bg-white border border-cream-200 shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-medium text-noir-900">
            Статус заявки
          </h3>

          <div className="space-y-2">
            {statusOptions.map((st) => {
              const isActive = currentStatus === st.value;
              return (
                <button
                  key={st.value}
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange(st.value)}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between border transition-all btn-press ${
                    isActive
                      ? `${st.color} border-current shadow-sm`
                      : "bg-cream-50/70 border-cream-200 text-noir-700 hover:bg-cream-100"
                  }`}
                >
                  <span>{st.label}</span>
                  {isActive && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date and Time Details */}
        <div className="p-6 rounded-3xl bg-white border border-cream-200 shadow-sm space-y-3">
          <h3 className="font-serif text-lg font-medium text-noir-900">
            Время готовности
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-noir-700">
              <Calendar className="w-4 h-4 text-brand-violet" />
              <span><b>Дата:</b> {order.pickup_date}</span>
            </div>
            <div className="flex items-center gap-2 text-noir-700">
              <Clock className="w-4 h-4 text-brand-violet" />
              <span><b>Интервал:</b> {order.pickup_time}</span>
            </div>
            <div className="text-[11px] text-noir-400 pt-2 border-t border-cream-100">
              Создан: {order.created_at}
            </div>
          </div>
        </div>

        {/* Internal Staff Notes */}
        <div className="p-6 rounded-3xl bg-white border border-cream-200 shadow-sm space-y-3">
          <h3 className="font-serif text-lg font-medium text-noir-900">
            Внутренние заметки
          </h3>
          <p className="text-[11px] text-noir-500 font-light">
            Заметки видны только сотрудникам кондитерской
          </p>
          <textarea
            rows={4}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Клиент просил дополнительную свечку, согласовано время 14:30..."
            className="w-full p-3 rounded-xl bg-cream-50 border border-cream-200 text-xs focus:outline-none focus:border-brand-violet"
          />
          <button
            onClick={handleSaveNotes}
            disabled={savingNotes}
            className="w-full py-2.5 px-4 rounded-xl bg-noir-900 hover:bg-brand-violet text-cream-50 text-xs font-semibold tracking-wider uppercase transition-colors btn-press flex items-center justify-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingNotes ? "Сохранение..." : "Сохранить заметку"}</span>
          </button>
          {notesSaved && (
            <p className="text-[11px] text-emerald-600 text-center font-medium">
              Заметки успешно сохранены!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
