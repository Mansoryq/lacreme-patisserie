import React from "react";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import getDb from "@/lib/db";
import AdminSettingsClient from "./AdminSettingsClient";

export default async function AdminSettingsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const db = getDb();

  const scheduleRows = db.prepare(`SELECT key, value FROM schedule_settings`).all() as { key: string; value: string }[];
  const schedule: Record<string, string> = {};
  for (const r of scheduleRows) {
    schedule[r.key] = r.value;
  }

  const siteRows = db.prepare(`SELECT key, value FROM site_settings`).all() as { key: string; value: string }[];
  const site: Record<string, string> = {};
  for (const r of siteRows) {
    site[r.key] = r.value;
  }

  const slots = db.prepare(`SELECT * FROM time_slots ORDER BY display_order ASC`).all() as any[];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="pb-3 border-b border-cream-200">
        <h1 className="font-serif text-3xl font-medium text-noir-950">
          Настройки расписания и Telegram
        </h1>
        <p className="text-xs text-noir-500 font-light mt-0.5">
          Управление доступными датами, лимитами заказов на интервал и проверка Telegram-бота
        </p>
      </div>

      <AdminSettingsClient
        initialSchedule={schedule}
        initialSite={site}
        initialSlots={slots}
        hasTelegramToken={!!process.env.TELEGRAM_BOT_TOKEN}
        hasTelegramChatId={!!process.env.TELEGRAM_CHAT_ID}
      />
    </div>
  );
}
