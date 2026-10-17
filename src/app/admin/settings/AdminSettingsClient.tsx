"use client";

import React, { useState } from "react";
import { Clock, Send, ShieldCheck, Check, AlertCircle, RefreshCw, Save } from "lucide-react";

interface TimeSlot {
  id: number;
  slot_label: string;
  max_orders: number;
  is_active: number;
  display_order: number;
}

interface Props {
  initialSchedule: Record<string, string>;
  initialSite: Record<string, string>;
  initialSlots: TimeSlot[];
  hasTelegramToken: boolean;
  hasTelegramChatId: boolean;
}

export default function AdminSettingsClient({
  initialSchedule,
  initialSite,
  initialSlots,
  hasTelegramToken,
  hasTelegramChatId,
}: Props) {
  const [schedule, setSchedule] = useState(initialSchedule);
  const [site, setSite] = useState(initialSite);
  const [slots, setSlots] = useState(initialSlots);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Telegram Test states
  const [testingTg, setTestingTg] = useState(false);
  const [tgTestResult, setTgTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSlotChange = (id: number, field: "max_orders" | "is_active", val: any) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schedule,
          site,
          slots,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      } else {
        alert(data.error || "Ошибка сохранения настроек");
      }
    } catch {
      alert("Сетевая ошибка");
    } finally {
      setSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    setTestingTg(true);
    setTgTestResult(null);

    try {
      const res = await fetch("/api/admin/telegram/test", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setTgTestResult({ success: true, message: data.message });
      } else {
        setTgTestResult({ success: false, message: data.error || "Ошибка отправки" });
      }
    } catch {
      setTgTestResult({ success: false, message: "Сетевая ошибка при тесте" });
    } finally {
      setTestingTg(false);
    }
  };

  return (
    <form onSubmit={handleSaveAll} className="space-y-8">
      {/* 1. Schedule & Booking Horizon */}
      <div className="p-6 rounded-3xl bg-white border border-cream-200 shadow-sm space-y-6">
        <div>
          <h2 className="font-serif text-xl font-medium text-noir-950 flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-violet" />
            <span>Правила расписания и готовности заказов</span>
          </h2>
          <p className="text-xs text-noir-500 font-light mt-0.5">
            Установите минимальные интервалы для подготовки выпечки и тортов
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs uppercase font-semibold text-noir-700 mb-1.5">
              Мин. время на подготовку (часов)
            </label>
            <input
              type="number"
              min={1}
              max={48}
              value={schedule.min_lead_time_hours || "3"}
              onChange={(e) =>
                setSchedule({ ...schedule, min_lead_time_hours: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-cream-200 text-xs font-semibold focus:outline-none focus:border-brand-violet"
            />
            <span className="text-[11px] text-noir-400 mt-1 block">
              Для готовой выпечки и десертов
            </span>
          </div>

          <div>
            <label className="block text-xs uppercase font-semibold text-noir-700 mb-1.5">
              Срок предзаказа тортов (дней)
            </label>
            <input
              type="number"
              min={1}
              max={14}
              value={schedule.preorder_lead_time_days || "1"}
              onChange={(e) =>
                setSchedule({ ...schedule, preorder_lead_time_days: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-cream-200 text-xs font-semibold focus:outline-none focus:border-brand-violet"
            />
            <span className="text-[11px] text-noir-400 mt-1 block">
              Для заказных и праздничных тортов
            </span>
          </div>

          <div>
            <label className="block text-xs uppercase font-semibold text-noir-700 mb-1.5">
              Горизонт бронирования (дней)
            </label>
            <input
              type="number"
              min={7}
              max={90}
              value={schedule.max_booking_horizon_days || "30"}
              onChange={(e) =>
                setSchedule({ ...schedule, max_booking_horizon_days: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-cream-200 text-xs font-semibold focus:outline-none focus:border-brand-violet"
            />
            <span className="text-[11px] text-noir-400 mt-1 block">
              На сколько дней вперед открыт календарь
            </span>
          </div>
        </div>

        {/* Business Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-cream-100">
          <div>
            <label className="block text-xs uppercase font-semibold text-noir-700 mb-1.5">
              Начало рабочего дня (часы)
            </label>
            <input
              type="text"
              value={schedule.business_hours_start || "09:00"}
              onChange={(e) =>
                setSchedule({ ...schedule, business_hours_start: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-cream-200 text-xs font-semibold focus:outline-none focus:border-brand-violet"
            />
          </div>
          <div>
            <label className="block text-xs uppercase font-semibold text-noir-700 mb-1.5">
              Конец рабочего дня (часы)
            </label>
            <input
              type="text"
              value={schedule.business_hours_end || "22:00"}
              onChange={(e) =>
                setSchedule({ ...schedule, business_hours_end: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-cream-200 text-xs font-semibold focus:outline-none focus:border-brand-violet"
            />
          </div>
        </div>
      </div>

      {/* 2. Time Slots & Capacities */}
      <div className="p-6 rounded-3xl bg-white border border-cream-200 shadow-sm space-y-4">
        <h2 className="font-serif text-xl font-medium text-noir-950">
          Интервалы времени и лимиты вместимости
        </h2>
        <p className="text-xs text-noir-500 font-light">
          Лимит определяет максимальное количество заказов, которые кондитерская может выдать в один слот
        </p>

        <div className="divide-y divide-cream-100">
          {slots.map((s) => (
            <div
              key={s.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={s.is_active === 1}
                  onChange={(e) =>
                    handleSlotChange(s.id, "is_active", e.target.checked ? 1 : 0)
                  }
                  className="rounded text-brand-violet focus:ring-brand-violet"
                />
                <span className={`font-semibold ${s.is_active ? "text-noir-900" : "text-noir-400 line-through"}`}>
                  {s.slot_label}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-noir-500">Макс. заказов:</span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={s.max_orders}
                  onChange={(e) =>
                    handleSlotChange(s.id, "max_orders", parseInt(e.target.value, 10) || 1)
                  }
                  className="w-16 px-2 py-1 rounded-lg bg-cream-50 border border-cream-200 text-center font-bold text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Telegram Integration & Testing */}
      <div className="p-6 rounded-3xl bg-white border border-cream-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-violet/10 text-brand-violet flex items-center justify-center flex-shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-medium text-noir-950">
                Telegram-бот уведомлений
              </h2>
              <p className="text-xs text-noir-500 font-light">
                Мгновенное оповещение сотрудников о каждой новой заявке
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                hasTelegramToken && hasTelegramChatId
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {hasTelegramToken && hasTelegramChatId ? "Токены заданы в .env" : "Токены не заданы"}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 text-xs text-noir-700 space-y-2">
          <div className="flex justify-between items-center">
            <span>TELEGRAM_BOT_TOKEN:</span>
            <span className="font-mono text-noir-900 font-semibold">
              {hasTelegramToken ? "••••••••••••••••••••••••••• (Защищено)" : "Не настроено"}
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-cream-200 pt-2">
            <span>TELEGRAM_CHAT_ID:</span>
            <span className="font-mono text-noir-900 font-semibold">
              {hasTelegramChatId ? "••••••••••• (Защищено)" : "Не настроено"}
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={handleTestTelegram}
            disabled={testingTg}
            className="px-5 py-2.5 rounded-xl bg-brand-violet hover:bg-brand-violet-dark text-white text-xs font-semibold tracking-wider uppercase transition-colors btn-press flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingTg ? "animate-spin" : ""}`} />
            <span>{testingTg ? "Проверка связи..." : "Отправить тестовое сообщение"}</span>
          </button>
        </div>

        {tgTestResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
              tgTestResult.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-red-50 border-red-200 text-red-900"
            }`}
          >
            {tgTestResult.success ? (
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{tgTestResult.message}</span>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="pt-2 flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3.5 rounded-2xl bg-noir-900 hover:bg-brand-violet text-cream-50 text-xs font-semibold tracking-widest uppercase transition-all shadow-md btn-press flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Сохранение настроек..." : "Сохранить все настройки"}</span>
        </button>

        {saveSuccess && (
          <span className="text-xs text-emerald-600 font-semibold animate-fade-in flex items-center gap-1">
            <Check className="w-4 h-4" /> Настройки успешно обновлены в базе данных!
          </span>
        )}
      </div>
    </form>
  );
}
