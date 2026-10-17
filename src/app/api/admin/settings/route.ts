import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
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

    const slots = db.prepare(`SELECT * FROM time_slots ORDER BY display_order ASC`).all();

    return NextResponse.json({
      success: true,
      schedule,
      site,
      slots,
      hasTelegramToken: !!process.env.TELEGRAM_BOT_TOKEN,
      hasTelegramChatId: !!process.env.TELEGRAM_CHAT_ID,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { schedule, site, slots } = body;
    const db = getDb();

    if (schedule && typeof schedule === "object") {
      const updateStmt = db.prepare(`
        INSERT INTO schedule_settings (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `);
      for (const [k, v] of Object.entries(schedule)) {
        updateStmt.run(k, String(v));
      }
    }

    if (site && typeof site === "object") {
      const updateStmt = db.prepare(`
        INSERT INTO site_settings (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `);
      for (const [k, v] of Object.entries(site)) {
        updateStmt.run(k, String(v));
      }
    }

    if (Array.isArray(slots)) {
      const updateSlotStmt = db.prepare(`
        UPDATE time_slots SET max_orders = ?, is_active = ? WHERE id = ?
      `);
      for (const s of slots) {
        updateSlotStmt.run(parseInt(s.max_orders, 10), s.is_active ? 1 : 0, s.id);
      }
    }

    return NextResponse.json({ success: true, message: "Настройки успешно сохранены" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
